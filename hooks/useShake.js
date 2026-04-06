import { useEffect } from "react";
import { Accelerometer } from "expo-sensors";

export default function useShake(onShake) {
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.abs(x + y + z);

      if (total > 2.5) {
        // 🔥 collision threshold
        onShake();
      }
    });

    return () => subscription.remove();
  }, []);
}