import { Platform } from "react-native";
import { sendDirectSms } from "../modules/expo-direct-sms"; // Import YOUR module

export const sendSMS = async (contacts, message) => {
  if (Platform.OS !== "android") return;

  if (!contacts || contacts.length === 0) return;

  try {
    contacts.forEach(async (contact) => {
      const rawNumber = typeof contact === 'object' ? contact.phone : contact;
      const cleanNumber = String(rawNumber).replace(/[^\d+]/g, "");
      const finalMessage = message || "Emergency Alert from ResQ!";

      try {
        // Call custom native SMS module
        await sendDirectSms(cleanNumber, finalMessage);
        if (__DEV__) {
          const masked = cleanNumber.length > 4 
            ? `${cleanNumber.slice(0, 3)}****${cleanNumber.slice(-2)}`
            : "****";
          console.log(`[SMS] Successfully dispatched alert to ${masked}`);
        }
      } catch (err) {
        if (__DEV__) {
          const masked = cleanNumber.length > 4 
            ? `${cleanNumber.slice(0, 3)}****${cleanNumber.slice(-2)}`
            : "****";
          console.warn(`[SMS] Dispatch failed for ${masked}:`, err?.message || err);
        }
      }
    });
  } catch (error) {
    if (__DEV__) {
      console.error("SMS Service error:", error);
    }
  }
};