import * as Location from "expo-location";
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";

export default function useShake(onCrash, active) {
  const isProcessing = useRef(false);
  const currentSpeed = useRef(0);
  const prevSpeed = useRef(0);
  
  
  const savedOnCrash = useRef(onCrash);
  useEffect(() => {
    savedOnCrash.current = onCrash;
  }, [onCrash]);

  useEffect(() => {
    if (!active) {
      isProcessing.current = false;
      return;
    }

    let accelSubscription;
    let locationSubscriptionPromise; 

    function startSensors() {
      // --- 1. START GPS TRACKING ---
      locationSubscriptionPromise = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
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
      Accelerometer.setUpdateInterval(100); // 100ms catches fast impacts better than 200ms
      accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const totalForce = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        const pureImpact = Math.abs(totalForce - 1);

        // PEDESTRIAN FALL DETECTOR
        if (
          pureImpact > 3.0 &&               // Hard impact
          currentSpeed.current > 0.7 &&     // Faster than standing still
          currentSpeed.current < 6.0 &&     // Slower than a car
          !isProcessing.current
        ) {
          console.log("PEDESTRIAN FALL DETECTED via Impact + Walking Speed!");
          triggerCrash();
        }
      });
    }

    const triggerCrash = () => {
      isProcessing.current = true;
      if (savedOnCrash.current) savedOnCrash.current();

      // Cooldown timer to prevent spamming
      setTimeout(() => {
        isProcessing.current = false;
      }, 10000);
    };

    startSensors();

    // CLEANUP: 
    return () => {
      if (locationSubscriptionPromise) {
        locationSubscriptionPromise.then((subscription) => {
          if (subscription) subscription.remove();
        });
      }
      
      if (accelSubscription) accelSubscription.remove();
    };
  }, [active]); 
}