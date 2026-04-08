 
import { getContacts } from "./contactService";
import { sendSMS } from "./smsService";

export const sendSOS = async (coords, user) => {
  if (!coords || !user) {
    console.log("Missing user or location");
    return;
  }

  const { latitude, longitude } = coords;

  const message = `EMERGENCY ALERT! I need help urgently. 
This is my Current Location https://maps.google.com/?q=${latitude},${longitude}`;

  try {
    const contacts = await getContacts(user.uid);
    console.log("Contacts:", contacts);
    sendSMS(contacts, message);
    console.log("SOS Sent via SIM");
  } catch (error) {
    console.log("SOS Failed:", error);
   } 
};