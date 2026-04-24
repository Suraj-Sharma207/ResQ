import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';

const { CrashSensor } = NativeModules;

// SAFETY CHECK: Only create the emitter if the Kotlin module actually exists
const crashEventEmitter = CrashSensor ? new NativeEventEmitter(CrashSensor) : null;

export default function useNativeShake(onCrash, active) {
  useEffect(() => {
    // SAFETY CHECK: Stop the app from crashing if Kotlin is missing!
    if (!CrashSensor) {
      console.warn("NATIVE MODULE MISSING: CrashSensor is null.");
      return; // <-- This line stops the "stopService of null" error!
    }

    if (!active) {
      CrashSensor.stopService();
      return;
    }

    CrashSensor.startService();

    const subscription = crashEventEmitter.addListener(
      'OnCrashDetected',
      () => {
        console.log("NATIVE BACKGROUND CRASH DETECTED!");
        onCrash();
      }
    );

    return () => {
      if (subscription) subscription.remove();
      CrashSensor.stopService();
    };
  }, [active]);
}