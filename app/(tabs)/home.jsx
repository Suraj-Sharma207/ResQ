import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useLocation from "../../hooks/useLocation";
import useShake from "../../hooks/useShake";

export default function Home() {
  const [isOn, setIsOn] = useState(false);

  const { address, coords } = useLocation();

  const router = useRouter();

  useShake(() => {
  if (isOn) {
    console.log("Collision detected!");
    router.push("/alert");
  }
});

  const openMap = () => {
    if (!coords) return;
    const url = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: isOn ? "#39d12f" : "#ff8a5c" }]}>

      {/* Location */}
      <TouchableOpacity style={styles.topSection} onPress={openMap}>
        <View style={styles.locationCard}>
          <View style={styles.row}>
            <Ionicons name="flash" size={18} color="#ff6b4a" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.locationTitle}>Current location</Text>
              <Text style={styles.locationText}>{address}</Text>
            </View>
          </View>
          <Ionicons name="navigate" size={18} color="#333" />
        </View>
      </TouchableOpacity>

      {/* 🔘 SOS */}
      <View style={styles.centerSection}>
        <TouchableOpacity onPress={() => setIsOn(!isOn)} style={styles.outerCircle}>
          <View style={[styles.innerCircle, { backgroundColor: isOn ? "#39d12f" : "#ff6b4a" }]}>
            <Text style={styles.buttonText}>{isOn ? "ON" : "OFF"}</Text>
          </View>
        </TouchableOpacity>
      </View>

    <TouchableOpacity
        style={styles.testButton}
        onPress={() => router.push("/alert")}
    >
        <Text style={styles.testText}>Test Alert 🚨</Text>
    </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
    paddingBottom: 100, // space for tab bar
  },

  topSection: {
    marginTop: 60,
    alignItems: "center",
  },

  locationCard: {
    width: "90%",
    backgroundColor: "#eee",
    borderRadius: 25,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationTitle: { fontSize: 12, color: "#777" },
  locationText: { fontSize: 16, fontWeight: "bold" },

  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  innerCircle: {
    width: 140,
    height: 140,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },

  testButton: {
    position: "absolute",
    bottom: 150,
    backgroundColor: "#a74235",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    paddingBottom: 10,
},

testText: {
  color: "#fff",
  fontWeight: "bold",
},
});