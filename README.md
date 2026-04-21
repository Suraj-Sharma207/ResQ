# ResQ - Smart Crash Detection Android App

ResQ is a React Native mobile application engineered to detect high-impact vehicle collisions and pedestrian falls in real-time. Designed as a robust "Offline-First" safety tool, ResQ bypasses the need for internet connectivity and cloud databases, ensuring that automatic emergency SMS alerts are dispatched even in cellular dead zones.

## Core Features
<h4>1. Multi-Sensor Fusion Engine:</h4>
Combines the device's Accelerometer (impact detection) with real-time GPS (speed tracking) to eliminate false positives. The app can distinguish between a dropped phone (0 m/s speed + high G-force) and a genuine pedestrian fall or car crash.

<h4>2.Offline-First Architecture:</h4>
Zero login required. Emergency contacts, medical profiles, and settings are encrypted and stored locally on the device using          AsyncStorage.

<h4>3.Background Native SMS:</h4>
Bypasses web-based SMS APIs to send texts directly from the user's native carrier network via custom Kotlin Android bridging.

<h4>4.Pinpoint Location Delivery:</h4>
Automatically embeds a universal Google Maps intent link with the exact latitude/longitude of the crash site in the emergency SMS.

## Tech Stack
- <b>Frontend:</b> React Native (Expo Framework)
- <b>Hardware Integration:</b> expo-sensors (Accelerometer), expo-location (High-Accuracy GPS), expo-audio
- <b>Local Storage:</b> @react-native-async-storage/async-storage
- <b>Native Code:</b> Custom Android Permissions & SMS dispatch mapping

## Installation & Setut
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ResQ.git
   cd ResQ
   ```
2. Install Dependencies:
   ```bash
    npm install
   ```
3. Build the Development Client (Android):
<br>Note: You must have an Expo account and EAS CLI installed.
   ```bash
    eas build --profile development --platform android
   ```
4. Start the Server:
<br>Install the resulting <b>.apk</b> on your physical Android device, then start the local bundler:
   ```bash
    npx expo start
   ```
Scan the QR code in your terminal using the ResQ Dev App on your phone.

## How to Test (Without actually crashing!)
Evaluating a crash-detection algorithm physically is difficult. Use the following "Mattress Tests" to safely verify the Multi-Sensor Fusion logic:

- <b>Test 1: The False Positive (Dropped Phone)</b>
     - Enable SOS mode on the dashboard.
     - Stand still and drop the phone flat onto a mattress.
     - Result: Ignored. The accelerometer triggers, but the GPS verifies a speed of 0 m/s.

- <b>Test 2: The Pedestrian Fall</b>
   - Enable SOS mode.
   - Jog briskly across the room (generating a GPS speed of ~2 to 5 m/s) and throw the phone onto the mattress.
   - Result: Triggered. The app detects walking speed + sudden impact and fires the Alert Screen.
 
- <b>Test 3: The End-to-End SMS</b>
   - Add your own phone number to the Trusted Contacts.
   - Trigger the alert via Test 2 and let the 30-second timer expire.
   - Result: You will receive an SMS containing your live Google Maps coordinates.
 
## Author
<h3>Suraj Kumar Sharma</h3>
- Master's of Computer Application
 
