import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import useAuth from "../hooks/useAuth";
import useLocation from "../hooks/useLocation";
import { sendSOS } from "../services/sosService";

// 1. IMPORT MISSING SMS AND FIREBASE SERVICES
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { sendSMS } from "../services/smsService";

export default function Alert() {
  const [time, setTime] = useState(30);
  const router = useRouter();

  const VIBRATION_PATTERN = [0, 500, 200, 500];
  const sirenPlayer = useAudioPlayer(require('../assets/siren.mp3'));

  const { coords } = useLocation();
  const [sent, setSent] = useState(false);
  const { user, loading } = useAuth();

  // State to hold emergency contacts
  const [contacts, setContacts] = useState([]);
  const coordsRef = useRef(coords);

  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  // 2. FETCH CONTACTS IN THE BACKGROUND
  // While the 30 seconds are ticking down, we silently load the contacts
  useEffect(() => {
    const fetchContacts = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const snapshot = await getDocs(
        collection(db, "users", currentUser.uid, "contacts")
      );
      const list = snapshot.docs.map((doc) => doc.data());
      setContacts(list);
    };

    fetchContacts();
  }, []);

  // --- TIMER & SOS LOGIC ---
  useEffect(() => {
    if (!user || sent) return;

    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setSent(true);

          // 3. SEND FIREBASE ALERT
          sendSOS(coordsRef.current, user);

          // 4. SEND BACKGROUND SMS TO ALL CONTACTS
          if (contacts.length > 0) {
            const phoneNumbers = contacts.map(c => c.phone);

            // Generate a clean Google Maps link using the ref coordinates
            const lat = coordsRef.current?.latitude;
            const lon = coordsRef.current?.longitude;
            const mapLink = `https://maps.google.com/?q=${lat},${lon}`;

            const message = `EMERGENCY! I need help. My location: ${mapLink}`;

            console.log("Sending Auto-SMS to:", phoneNumbers);
            sendSMS(phoneNumbers, message);
          }

          // 5. NAVIGATION FIX
          // Removed handleStopAlert() from here so it doesn't conflict with replace()
          setTimeout(() => {
            safeStopAlert();
            router.replace("/profile");
          }, 3000);

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, sent, contacts]); // Added 'contacts' to dependency array

  // --- SIREN & VIBRATION LOGIC ---
  useEffect(() => {
    Vibration.vibrate(VIBRATION_PATTERN, true);
    sirenPlayer.loop = true;
    sirenPlayer.play();

    return () => {
      Vibration.cancel();
    };
  }, []);

  const safeStopAlert = () => {
    Vibration.cancel();
    try {
      sirenPlayer.pause();
    } catch (error) {
      console.log("Player already released, safe to ignore.");
    }
  };

  // --- MANUAL STOP BUTTON ---
  const handleStopAlert = () => {
    safeStopAlert(); // Use the safe stop logic here too
    router.back();
  };

  return (
    <View style={styles.container}>

      {/*  Alert Card */}
      <LinearGradient colors={["#fd8e63", "#ff5f5f"]} style={styles.card}>
        <Text style={styles.title}>Are you safe?</Text>

        <Text style={styles.subtitle}>
          We detected unusual movement
        </Text>

        <Text style={styles.subtitle}>
          If you don’t respond,
        </Text>

        <Text style={styles.subtitle}>
          Help will be alerted automatically within
        </Text>

        {/*  Timer */}
        <Text style={styles.timer}>{time}</Text>
      </LinearGradient>

      {/* Stop Button */}
      <TouchableOpacity style={styles.button} onPress={handleStopAlert}>
        <Text style={styles.buttonText}>Stop Alert</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaeaea",
    alignItems: "center",
    justifyContent: "flex-start",

  },

  card: {
    width: "100%",
    height: "55%",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginTop: 60,
  },

  subtitle: {
    color: "#fff",
    fontSize: 18,
  },

  timer: {
    fontSize: 200,
    fontWeight: "bold",
    color: "#ffd6a5",
    textAlign: "center",
  },

  button: {
    marginTop: 40,
    backgroundColor: "#ff7a45",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});