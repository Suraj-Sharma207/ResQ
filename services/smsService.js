// import SmsAndroid from "react-native-get-sms-android";

// export const sendSMS = (contacts, message) => {
//   contacts.forEach((number) => {
//     SmsAndroid.autoSend(
//       number,
//       message,
//       (fail) => console.log("SMS Failed:", fail),
//       (success) => console.log("SMS Sent:", success)
//     );
//   });
// };

import { Platform } from "react-native";
import * as SMS from "expo-sms";
import Constants from "expo-constants";

export const sendSMS = async (contacts, message) => {
  // 🟢 EXPO GO (DEV MODE)
  if (Constants.appOwnership === "expo") {
    console.log("📱 Using Expo SMS");

    const available = await SMS.isAvailableAsync();

    if (!available) {
      console.log("SMS not available");
      return;
    }

    await SMS.sendSMSAsync(contacts, message);
    return; 
  }

  //PRODUCTION (APK)
  console.log("Using Native SMS");

  //const SmsAndroid = require("react-native-get-sms-android");

//   contacts.forEach((number) => {
//     SmsAndroid.autoSend(
//       number,
//       message,
//       (fail) => console.log("SMS Failed:", fail),
//       (success) => console.log("SMS Sent:", success)
//     );
//   });
};