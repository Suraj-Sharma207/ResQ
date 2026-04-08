import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSVgYEbjh4R-tsDHXvpNz0jC2m71KJYY4",
  authDomain: "resq-26.firebaseapp.com",
  projectId: "resq-26",
  storageBucket: "resq-26.firebasestorage.app",
  messagingSenderId: "425033290503",
  appId: "1:425033290503:web:a1f2ece56570a665b0aba2",
  measurementId: "G-9M9GDWCC71"
};

const app = initializeApp(firebaseConfig);

// FIXED AUTH (persistent login)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);