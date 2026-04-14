import { requireNativeModule } from 'expo-modules-core';

// Load the native Kotlin module we just created
const ExpoDirectSms = requireNativeModule('ExpoDirectSms');

export async function sendDirectSms(phoneNumber: string, message: string): Promise<string> {
  return await ExpoDirectSms.sendSMS(phoneNumber, message);
}