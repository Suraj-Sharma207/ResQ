import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";

export default function useShake(onShake, active) {

  const isProcessing = useRef(false);

  useEffect(() => {
    if (!active) {
      isProcessing.current = false;
      return;
    }

    Accelerometer.setUpdateInterval(200);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

      const pureImpact = Math.abs(totalForce - 1);

      if (pureImpact > 3.0 && !isProcessing.current) {
        console.log("COLLISION DETECTED! Impact Force:", pureImpact);

        isProcessing.current = true;

        onShake();

        setTimeout(() => {
          isProcessing.current = false;
        }, 10000);
      }
    });

    return () => subscription.remove();
  }, [active, onShake]);
}