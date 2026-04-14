 import { Platform, Alert } from "react-native";
import mobileSms from 'react-native-mobile-sms'; // Use the library you just installed

export const sendSMS = async (contacts, message) => {
  if (Platform.OS !== "android") {
    console.log("SMS only works on Android");
    return;
  }

  if (!contacts || contacts.length === 0) {
    console.log("No contacts available to send SMS");
    return;
  }

  try {
    contacts.forEach((contact) => {
      // 1. Extract the phone number
      const rawNumber = typeof contact === 'object' ? contact.phone : contact;
      
      // 2. Clean the number (keep digits and + only)
      const cleanNumber = String(rawNumber).replace(/[^\d+]/g, "");

      // 3. Ensure message isn't empty
      const finalMessage = message || "Emergency Alert from ResQ!";

      console.log(`Sending SMS to: ${cleanNumber}`);

      // 4. Use the correct library function (mobileSms)
      mobileSms.sendDirectSms(cleanNumber, finalMessage)
        .then(() => {
          console.log(`SMS successfully sent to ${cleanNumber}`);
        })
        .catch((err) => {
          console.error("SMS sending failed:", err);
          Alert.alert("SMS Failed", `To: ${cleanNumber}\nError: ${err}`);
        });
    });
  } catch (error) {
    console.error("Native module error:", error);
    Alert.alert("Module Error", "Could not access the native SMS module.");
  }
};