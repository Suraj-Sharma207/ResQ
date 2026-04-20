import * as Location from "expo-location";
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";

export default function useShake(onCrash, active) {
  const isProcessing = useRef(false);

  // We use refs so the sensors can share data instantly without re-rendering the screen
  const currentSpeed = useRef(0);
  const prevSpeed = useRef(0);

  // 🚨 TEMPORARY DEVELOPER TEST START 🚨
  useEffect(() => {
    if (!active) return;

    // After 10 seconds, fake a massive car crash
    const devTimer = setTimeout(() => {
      console.log("DEV TEST: Faking a 60km/h crash!");
      prevSpeed.current = 20; // 20 m/s (approx 70 km/h)
      currentSpeed.current = 0; // Instant stop

      // Manually trigger the crash logic
      if (prevSpeed.current > 8 && currentSpeed.current < 1) {
        triggerCrash();
      }
    }, 10000);

    return () => clearTimeout(devTimer);
  }, [active]);
  // 🚨 TEMPORARY DEVELOPER TEST END 🚨


  useEffect(() => {
    if (!active) {
      isProcessing.current = false;
      return;
    }

    let locationSubscription;
    let accelSubscription;

    async function startSensors() {
      // --- 1. START GPS TRACKING ---
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          // Update our live speed ref (m/s)
          const speed = location.coords.speed || 0;
          currentSpeed.current = speed;

          // VEHICLE CRASH DETECTOR (High speed drops to zero)
          // 8 m/s is roughly 30 km/h
          if (prevSpeed.current > 8 && speed < 1 && !isProcessing.current) {
            console.log("VEHICLE CRASH DETECTED via GPS Deceleration!");
            triggerCrash();
          }

          prevSpeed.current = speed;
        }
      );

      // --- 2. START ACCELEROMETER ---
      Accelerometer.setUpdateInterval(200);
      accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const totalForce = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        const pureImpact = Math.abs(totalForce - 1); // Subtract gravity

        // PEDESTRIAN FALL DETECTOR
        // They must experience high impact AND be moving at a walking/jogging speed
        if (
          pureImpact > 3.0 &&               // Hard impact
          currentSpeed.current > 0.5 &&     // Faster than standing still
          currentSpeed.current < 6.0 &&     // Slower than a car
          !isProcessing.current
        ) {
          console.log("PEDESTRIAN FALL DETECTED via Impact + Walking Speed!");
          triggerCrash();
        }
      });
    }

    // --- HELPER TO TRIGGER ALERT ONCE ---
    const triggerCrash = () => {
      isProcessing.current = true;
      onCrash();

      // Cooldown timer to prevent spamming
      setTimeout(() => {
        isProcessing.current = false;
      }, 10000);
    };

    startSensors();

    // CLEANUP: Stop both sensors when the user turns SOS off or leaves the app
    return () => {
      if (locationSubscription) locationSubscription.remove();
      if (accelSubscription) accelSubscription.remove();
    };
  }, [active, onCrash]);
}