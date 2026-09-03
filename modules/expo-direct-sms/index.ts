import { requireNativeModule, requireOptionalNativeModule } from 'expo-modules-core';

// Safely load the native Kotlin module so Expo Go and Web don't crash on import
let ExpoDirectSms: any = null;
try {
  if (typeof requireOptionalNativeModule === 'function') {
    ExpoDirectSms = requireOptionalNativeModule('ExpoDirectSms');
  } else {
    ExpoDirectSms = requireNativeModule('ExpoDirectSms');
  }
} catch (e) {
  console.warn("ExpoDirectSms native module not found (running in Expo Go or Web). Using safe mock fallback.");
}

export async function sendDirectSms(phoneNumber: string, message: string): Promise<string> {
  if (!ExpoDirectSms) {
    console.warn(`[Expo Go Mock] Simulated SMS to ${phoneNumber}: ${message}`);
    return `Simulated SMS sent to ${phoneNumber}`;
  }
  return await ExpoDirectSms.sendSMS(phoneNumber, message);
}