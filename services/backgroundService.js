// services/backgroundService.js
import ReactNativeForegroundService from "@supersami/rn-foreground-service";

// Register the service (Call this once when the app starts)
export const setupBackgroundService = () => {
  ReactNativeForegroundService.register();
};

// Start the sticky notification to keep the app awake
export const startSOSBackgroundMode = () => {
  ReactNativeForegroundService.start({
    id: 144,
    title: "ResQ SOS Active",
    message: "Monitoring sensors for crash detection...",
    icon: "ic_launcher",
    button: false,
    button2: false,
  });
};

// Stop the notification when the user turns SOS off
export const stopSOSBackgroundMode = () => {
  ReactNativeForegroundService.stopAll();
};