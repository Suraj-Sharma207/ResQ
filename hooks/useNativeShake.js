import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';

const { CrashSensor } = NativeModules;

// SAFETY CHECK: Only create the emitter if the module actually exists
const crashEventEmitter = CrashSensor ? new NativeEventEmitter(CrashSensor) : null;

export default function useNativeShake(onCrash, active) {
  useEffect(() => {
    // SAFETY CHECK: Stop the hook from crashing if Kotlin isn't linked yet
    if (!CrashSensor) {
      console.warn("NATIVE MODULE MISSING: CrashSensor is null. Are you in Expo Go?");
      return;
    }

    if (!active) {
      CrashSensor.stopService();
      return;
    }

    CrashSensor.startService();

    const subscription = crashEventEmitter.addListener(
      'OnCrashDetected',
      () => {
        console.log("NATIVE BACKGROUND CRASH DETECTED! 🚨");
        onCrash();
      }
    );

    return () => {
      if (subscription) subscription.remove();
      CrashSensor.stopService();
    };
  }, [active]);
}