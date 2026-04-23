import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';

// Target the Kotlin module we named "CrashSensor"
const { CrashSensor } = NativeModules;
const crashEventEmitter = new NativeEventEmitter(CrashSensor);

export default function useNativeShake(onCrash, active) {
  useEffect(() => {
    if (!active) {
      CrashSensor.stopService();
      return;
    }

    // Command Android to start the native service
    CrashSensor.startService();

    // Listen for the native BroadcastReceiver to yell "OnCrashDetected"
    const subscription = crashEventEmitter.addListener(
      'OnCrashDetected',
      () => {
        console.log("NATIVE BACKGROUND CRASH DETECTED! 🚨");
        onCrash();
      }
    );

    // CLEANUP: Stop the service and remove the listener when toggled off
    return () => {
      subscription.remove();
      CrashSensor.stopService();
    };
  }, [active]);
}