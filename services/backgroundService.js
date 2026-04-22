import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
// Import your local storage and SMS functions!
import { getLocalContacts } from './storageService'; 
// import { sendSMS } from './smsService'; // Assuming you have this from your alert screen!

const SOS_TASK_NAME = 'resq-sos-background-task';

// Top-level variables to hold speed memory while app is locked
let prevSpeed = 0;
let isProcessingCrash = false;

// 1. THE AUTONOMOUS BACKGROUND BRAIN
TaskManager.defineTask(SOS_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background Task Error:", error);
    return;
  }

  if (data && data.locations) {
    // Get the most recent location data
    const location = data.locations[0];
    const currentSpeed = location.coords.speed || 0;

    console.log(`[Background] Speed: ${currentSpeed.toFixed(2)} m/s`);

    // --- BACKGROUND VEHICLE CRASH DETECTION ---
    // If we were going faster than 8m/s (30km/h) and suddenly stop...
    if (prevSpeed > 8 && currentSpeed < 1 && !isProcessingCrash) {
      isProcessingCrash = true;
      
      try {
        // 1. Fetch contacts from local phone storage
        const contacts = await getLocalContacts();
        
        if (contacts.length > 0) {
          const lat = location.coords.latitude;
          const lon = location.coords.longitude;
          const mapLink = `https://maps.google.com/?q=$${lat},${lon}`;
          const message = `EMERGENCY (Auto-Detected)! I may have been in a crash. My exact location: ${mapLink}`;
          
          // 2. Fire the SMS directly from the locked phone!
          const phoneNumbers = contacts.map(c => c.phone);
          // Uncomment this once your sendSMS function is imported:
          // sendSMS(phoneNumbers, message); 
          
          console.log("Background SMS Dispatched to:", phoneNumbers);
        }
      } catch (err) {
        console.error("Failed to send background SMS", err);
      }

      // Reset the crash processor after 2 minutes
      setTimeout(() => {
        isProcessingCrash = false;
      }, 120000);
    }

    // Update the speed memory for the next tick
    prevSpeed = currentSpeed;
  }
});

// Used to prevent Home.jsx from crashing
export const setupBackgroundService = () => {};

// 2. Start the tracking
export const startSOSBackgroundMode = async () => {
  try {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') return;

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') return;

    // Reset memory when starting
    prevSpeed = 0;
    isProcessingCrash = false;

    // We changed distanceInterval to 0 so it updates constantly based on time instead of distance
    await Location.startLocationUpdatesAsync(SOS_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 2000, 
      distanceInterval: 0, 
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "ResQ SOS Active",
        notificationBody: "Monitoring vehicle speed in the background.",
        notificationColor: "#ff8a5c",
      },
    });
    
    console.log("Background Service Started!");
  } catch (err) {
    console.log("Error starting background service:", err);
  }
};

// 3. Stop the tracking
export const stopSOSBackgroundMode = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(SOS_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(SOS_TASK_NAME);
      console.log("Background Service Stopped.");
    }
  } catch (err) {
    console.log("Error stopping background service:", err);
  }
};