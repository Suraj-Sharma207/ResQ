import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const SOS_TASK_NAME = 'resq-sos-background-task';

// 1. Define the background task (Must be outside of any React components!)
TaskManager.defineTask(SOS_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Background Task Error:", error);
    return;
  }
  // The beauty of this is we don't actually need to process the data here.
  // The simple act of this task running forces Android to keep our app completely awake!
});

// We leave this empty so we don't have to delete it from Home.jsx
export const setupBackgroundService = () => {};

// 2. Start the official Expo Foreground Service
export const startSOSBackgroundMode = async () => {
  try {
    // Background tracking requires explicit user permission
    const { status } = await Location.requestBackgroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn("Background location permission denied.");
      return;
    }

    // This command automatically creates the sticky Android Notification!
    await Location.startLocationUpdatesAsync(SOS_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 1, // Update every 1 meter
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "ResQ SOS Active",
        notificationBody: "Monitoring sensors for crashes in the background.",
        notificationColor: "#ff8a5c",
      },
    });
    
    console.log("Background Service Started!");
  } catch (err) {
    console.log("Error starting background service:", err);
  }
};

// 3. Safely kill the service
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