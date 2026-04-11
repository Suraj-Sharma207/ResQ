// import { useEffect } from "react";
// import { Accelerometer } from "expo-sensors";

// export default function useShake(onShake) {
//   useEffect(() => {
//     Accelerometer.setUpdateInterval(300);

//     const subscription = Accelerometer.addListener(({ x, y, z }) => {
//       const total = Math.abs(x + y + z);

//       if (total > 4.5) {
//         //collision threshold
//         onShake();
//       }
//     });

//     return () => subscription.remove();
//   }, []);
// }

import { useEffect } from "react";
import { Accelerometer } from "expo-sensors";

export default function useShake(onShake, active) {
  useEffect(() => {
    if (!active) return; // If SOS is OFF, do nothing.

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Magnitude calculation (more accurate than abs(x+y+z))
      const totalForce = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

      if (totalForce > 5.0) { 
        onShake();
      }
    });

    return () => subscription.remove();
  }, [active, onShake]); // Hook re-runs when active state changes
}