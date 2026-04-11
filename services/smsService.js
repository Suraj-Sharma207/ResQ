import { Platform } from "react-native";

export const sendSMS = async (contacts, message) => {
  if (Platform.OS !== "android") {
    console.log("SMS only works on Android");
    return;
  }

  // Use a try-catch to prevent crashes if the module is missing
  try {
    const SmsAndroid = require("react-native-get-sms-android");

    contacts.forEach((contact) => {
      // Ensure you are passing the phone number string, not the contact object
      const phoneNumber = typeof contact === 'object' ? contact.phone : contact;

      SmsAndroid.autoSend(
        phoneNumber,
        message,
        (fail) => console.log("SMS Failed for " + phoneNumber, fail),
        (success) => console.log("SMS Sent to " + phoneNumber, success)
      );
    });
  } catch (error) {
    console.error("Native SMS module not found.", error);
  }
};