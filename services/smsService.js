import { Platform } from "react-native";

export const sendSMS = async (contacts, message) => {
  if (Platform.OS === "android") {
    // Native SMS (AUTO SEND)
    const SmsAndroid = require("react-native-get-sms-android");

    contacts.forEach((number) => {
      SmsAndroid.autoSend(
        number,
        message,
        (fail) => console.log("SMS Failed:", fail),
        (success) => console.log("SMS Sent:", success)
      );
    });
  } else {
    console.log("SMS only works on Android");
  }
};