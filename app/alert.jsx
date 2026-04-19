import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import useAuth from "../hooks/useAuth";
import useLocation from "../hooks/useLocation";
import { sendSOS } from "../services/sosService";

export default function Alert() {
  const [time, setTime] = useState(30);
  const router = useRouter();

  // vibration pattern: [Wait time, Vibrate time, Wait time, Vibrate time...]
  const VIBRATION_PATTERN = [0, 500, 200, 500];
  const sirenPlayer = useAudioPlayer(require('../assets/siren.mp3'));

  //Get live location
  const { coords } = useLocation();
  const [sent, setSent] = useState(false);
  const { user, loading } = useAuth();

  const coordsRef = useRef(coords);

  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  // --- TIMER & SOS LOGIC ---
  useEffect(() => {
    if (!user || sent) return;

    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setSent(true);
          sendSOS(coordsRef.current, user);
          setTimeout(() => {
            handleStopAlert();
            router.replace("/home");
          }, 3000);

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, sent]);

  // --- SIREN & VIBRATION LOGIC ---
  useEffect(() => {
    Vibration.vibrate(VIBRATION_PATTERN, true);
    sirenPlayer.play();

    return () => {
      Vibration.cancel();
      sirenPlayer.pause();
    };
  }, []);

  // --- MANUAL STOP BUTTON ---
  const handleStopAlert = () => {
    Vibration.cancel();
    sirenPlayer.pause();
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
      <TouchableOpacity style={styles.button} onPress={stopAlert}>
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