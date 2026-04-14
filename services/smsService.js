import { Platform, Alert } from "react-native";
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
        // Call your custom Kotlin code!
        await sendDirectSms(cleanNumber, finalMessage);
        console.log(`Successfully silently sent to ${cleanNumber}`);
        alert(`SMS sent from ${cleanNumber}`)
      } catch (err) {
        console.log(`Failed for ${cleanNumber}:`, err);
         alert(`SMS faild from ${cleanNumber}`,err)
      }
    });
  } catch (error) {
    console.error("Service error:", error);
  }
};