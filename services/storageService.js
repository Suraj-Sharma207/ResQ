// services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_KEY = '@resq_contacts';
const PROFILE_KEY = '@resq_profile';

// --- CONTACTS ---
export const getLocalContacts = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CONTACTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading local contacts", e);
    return [];
  }
};

export const saveLocalContacts = async (contacts) => {
  try {
    const jsonValue = JSON.stringify(contacts);
    await AsyncStorage.setItem(CONTACTS_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving local contacts", e);
  }
};

// --- PROFILE ---
export const getLocalProfile = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error reading local profile", e);
    return null;
  }
};

export const saveLocalProfile = async (profileData) => {
  try {
    const jsonValue = JSON.stringify(profileData);
    await AsyncStorage.setItem(PROFILE_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving local profile", e);
  }
};