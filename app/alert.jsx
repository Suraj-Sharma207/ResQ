import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useLocation from "../hooks/useLocation";
import { sendSOS } from "../services/sosService";
import useAuth from "../hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";

export default function Alert() {
  const [time, setTime] = useState(10);
  const router = useRouter();

  //Get live location
  const { coords } = useLocation();
  const [sent, setSent] = useState(false);
  const { user, loading } = useAuth();

   useEffect(() => {
    if (!coords || !user || sent) return;

    let current = 10;

    const timer = setInterval(() => {
        current -= 1;
        setTime(current);

        if (current <= 0) {
        clearInterval(timer);

        setSent(true);
        sendSOS(coords, user);
        
        setInterval(() => {router.replace("/home")}, 5000);
        }
    }, 1000);

    return () => clearInterval(timer);
    }, [coords, user, sent]);

  //  Stop Alert
  const stopAlert = () => {
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