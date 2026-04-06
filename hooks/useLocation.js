import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function useLocation() {
  const [address, setAddress] = useState("Fetching location...");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    startTracking();
  }, []);

  const startTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setAddress("Permission denied");
      return;
    }

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;
        setCoords({ latitude, longitude });

        let result = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (result.length > 0) {
          const place = result[0];
          setAddress(
            `${place.name || ""}, ${place.street || ""}, ${place.city || ""}`
          );
        }
      }
    );
  };

  return { address, coords };
}