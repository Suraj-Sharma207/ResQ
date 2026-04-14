import { Platform, Alert } from "react-native";

export const sendSMS = async (contacts, message) => {
  if (Platform.OS !== "android") {
    console.log("SMS only works on Android");
    return;
  }

  try {
    const SmsAndroid = require("react-native-get-sms-android");

    if (!contacts || contacts.length === 0) {
      console.log("No contacts provided to sendSMS");
      return;
    }

    contacts.forEach((contact) => {
      // 1. Get the raw number
      let rawNumber = typeof contact === 'object' ? contact.phone : contact;

      // 2. CLEAN the number (Keep only numbers and the '+' sign)
      const phoneNumber = String(rawNumber).replace(/[^\d+]/g, "");

      // 3. Ensure message is not empty (Android rejects empty SMS)
      const finalMessage = message || "Emergency SOS Alert!";

      console.log(`Attempting autoSend to: ${phoneNumber}`);

      SmsAndroid.autoSend(
        phoneNumber,
        finalMessage,
        (fail) => {
          console.log("SMS Failed:", fail);
          // ALERT TO PHONE SCREEN FOR DEBUGGING
          Alert.alert("SMS Failed", `To: ${phoneNumber} Error: ${fail}`);
        },
        (success) => {
          console.log("SMS Success:", success);
          // ALERT TO PHONE SCREEN FOR DEBUGGING
          Alert.alert("SMS Sent!", `Message delivered to ${phoneNumber}`);
        }
      );
    });
  } catch (error) {
    Alert.alert("Module Error", "Native SMS module not found in this build.");
    console.error("Native SMS module not found.", error);
  }
};