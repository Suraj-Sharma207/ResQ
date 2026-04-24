package com.anonymous.ResQ 

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SensorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var receiver: BroadcastReceiver? = null

    override fun getName(): String {
        return "CrashSensor"
    }

    @ReactMethod
    fun startService() {
        val context = reactApplicationContext
        val serviceIntent = Intent(context, CrashSensorService::class.java)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }

        if (receiver == null) {
            receiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    sendEvent("OnCrashDetected", null)
                }
            }
            LocalBroadcastManager.getInstance(context).registerReceiver(
                receiver!!, IntentFilter("CRASH_DETECTED_EVENT")
            )
        }
    }

    @ReactMethod
    fun stopService() {
        val context = reactApplicationContext
        val serviceIntent = Intent(context, CrashSensorService::class.java)
        context.stopService(serviceIntent)

        receiver?.let {
            LocalBroadcastManager.getInstance(context).unregisterReceiver(it)
            receiver = null
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}