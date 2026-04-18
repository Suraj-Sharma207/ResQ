import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";
import useLocation from "../hooks/useLocation";
import { sendSOS } from "../services/sosService";
import useAuth from "../hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";

export default function Alert() {
  const [time, setTime] = useState(10);
  const router = useRouter();
  const [sound, setSound] = useState();

  // vibration pattern: [Wait time, Vibrate time, Wait time, Vibrate time...]
  const VIBRATION_PATTERN = [0, 500, 200, 500];

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

    let current = 10;

    const timer = setInterval(() => {
      // 4. THE FIX: Use React's previous state instead of a local 'current' variable
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setSent(true);
          
          // Grab the latest location directly from the ref!
          sendSOS(coordsRef.current, user);
          
          setTimeout(() => {
            handleStopAlert(); 
            router.replace("/home");
          }, 5000);

          return 0; // Lock the timer at 0 visually
        }
        return prevTime - 1; // Count down safely
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, sent]);

  // --- SIREN & VIBRATION LOGIC ---
  useEffect(() => {
    let currentSound; // 4. FIXED: Local reference for reliable cleanup

    Vibration.vibrate(VIBRATION_PATTERN, true);

    async function playSiren() {
      try {
        const { sound: audioSound } = await Audio.Sound.createAsync(
          require('../assets/siren.mp3') // Adjust path if needed
        );
        currentSound = audioSound; // Store it locally for the cleanup function
        setSound(audioSound); // Store it in state for the manual stop button
        
        await audioSound.setIsLoopingAsync(true);
        await audioSound.playAsync();
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }

    playSiren();

    // CLEANUP: Runs when the component unmounts
    return () => {
      Vibration.cancel();
      if (currentSound) {
        currentSound.unloadAsync(); // safely unload using the local reference
      }
    };
  }, []); 

  // --- MANUAL STOP BUTTON ---
  const handleStopAlert = async () => {
    Vibration.cancel();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync(); // Unload to free up phone memory
    }
    router.back(); 
  };
  
  return (
    <View style={styles.container}>
      
      {/*  Alert Card */}
      <LinearGradient colors={["#fd8e63","#ff5f5f"]} style={styles.card}>
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
    borderBottomLeftRadius:35,
    borderBottomRightRadius:35,
    justifyContent:"center",
    padding: 25,
  },

  title: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginTop:60,
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