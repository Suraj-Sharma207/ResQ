package com.anonymous.ResQ

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import kotlin.math.sqrt

class CrashSensorService : Service(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private var accelerometer: Sensor? = null
    private val CHANNEL_ID = "ResQSosChannel"

    // --- WakeLock: keeps CPU alive when screen is off ---
    private var wakeLock: PowerManager.WakeLock? = null

    // --- Crash debounce: sliding window approach ---
    // Require 2+ readings above threshold within CRASH_WINDOW_MS to avoid
    // false positives from single-spike events (potholes, drops, bumps).
    private val CRASH_THRESHOLD_G = 2.5         // Slightly lower so real crashes aren't missed
    private val CRASH_WINDOW_MS = 300L           // 300ms window for spike correlation
    private val REQUIRED_SPIKE_COUNT = 2         // Need at least 2 readings above threshold
    private var spikeCount = 0
    private var firstSpikeTimestamp = 0L
    private var isProcessingCrash = false
    private var lastCrashTimestamp = 0L
    private val CRASH_COOLDOWN_MS = 120_000L     // 2-minute cooldown between triggers

    override fun onCreate() {
        super.onCreate()
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🚨 ResQ SOS Active")
            .setContentText("Monitoring accelerometer in the background.")
            .setSmallIcon(applicationInfo.icon)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        startForeground(144, notification)

        // Acquire PARTIAL_WAKE_LOCK so the CPU stays awake even when screen is locked.
        // Without this, the OS puts the CPU to sleep and the sensor stops firing callbacks.
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "ResQ::CrashSensorWakeLock"
        )
        wakeLock?.acquire()

        // SENSOR_DELAY_GAME = ~20ms sampling rate (vs SENSOR_DELAY_NORMAL = ~200ms).
        // A car crash impulse lasts 50-150ms — we need 20ms sampling to catch the peak.
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }

        return START_STICKY
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type != Sensor.TYPE_ACCELEROMETER) return
        if (isProcessingCrash) return

        // Enforce cooldown between crash triggers
        val now = System.currentTimeMillis()
        if (now - lastCrashTimestamp < CRASH_COOLDOWN_MS) return

        // Normalize accelerometer values to G-force units
        val x = event.values[0] / SensorManager.GRAVITY_EARTH
        val y = event.values[1] / SensorManager.GRAVITY_EARTH
        val z = event.values[2] / SensorManager.GRAVITY_EARTH
        val totalG = sqrt((x * x + y * y + z * z).toDouble())

        if (totalG > CRASH_THRESHOLD_G) {
            if (spikeCount == 0) {
                // Start the sliding window on first spike
                firstSpikeTimestamp = now
                spikeCount = 1
            } else if (now - firstSpikeTimestamp <= CRASH_WINDOW_MS) {
                // Another spike within the window
                spikeCount++
                if (spikeCount >= REQUIRED_SPIKE_COUNT) {
                    // Confirmed crash pattern — fire the event
                    isProcessingCrash = true
                    lastCrashTimestamp = now
                    spikeCount = 0
                    LocalBroadcastManager.getInstance(this)
                        .sendBroadcast(Intent("CRASH_DETECTED_EVENT"))
                    // Release the processing lock after cooldown
                    Handler(Looper.getMainLooper()).postDelayed({
                        isProcessingCrash = false
                    }, CRASH_COOLDOWN_MS)
                }
            } else {
                // Spikes too spread out — reset the window
                firstSpikeTimestamp = now
                spikeCount = 1
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onDestroy() {
        super.onDestroy()
        sensorManager.unregisterListener(this)
        // Release WakeLock to avoid battery drain after service stops
        wakeLock?.let { if (it.isHeld) it.release() }
        wakeLock = null
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "ResQ Background Service",
                NotificationManager.IMPORTANCE_HIGH
            )
            getSystemService(NotificationManager::class.java)
                ?.createNotificationChannel(serviceChannel)
        }
    }
}