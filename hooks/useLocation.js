import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function useLocation(active) {
  const [address, setAddress] = useState("Standby...");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!active) {
      setAddress("SOS is Off");
      return;
    }

    setAddress("Fetching location...");
    
    let locationSubscriptionPromise;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Permission denied");
        return;
      }

      locationSubscriptionPromise = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          setCoords({ latitude, longitude });
          try {
            let result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result.length > 0) {
              const place = result[0];
              const formattedAddress = [place.name, place.street, place.city]
                .filter(Boolean)
                .join(", ");
              setAddress(formattedAddress || "Location found");
            }
          } catch (error) {
            setAddress("Offline (GPS Active)");
          }
        }
      );
    };

    startTracking();

    // CLEANUP
    return () => {
      if (locationSubscriptionPromise) {
        locationSubscriptionPromise.then((subscription) => {
          if (subscription) subscription.remove();
        });
      }
    };
  }, [active]);  

  return { address, coords };
}