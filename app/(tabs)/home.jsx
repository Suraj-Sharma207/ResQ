import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import { Alert, Linking, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebase";
import useAuth from "../../hooks/useAuth";
import useLocation from "../../hooks/useLocation";
import useShake from "../../hooks/useShake";

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const { address, coords } = useLocation();
  const router = useRouter();
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);

  // Fetch Contacts
  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  const requestSMSPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: "SMS Permission",
          message: "This app needs permission to send automatic background SMS during emergencies.",
          buttonPositive: "Allow",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const toggleSOS = async () => {
    if (!isOn) {
      if (!checkContacts()) return;
      const granted = await requestSMSPermission();
      if (!granted) {
        Alert.alert("Permission Denied", "Automatic SOS requires SMS permissions. Please enable them in settings.");
        return;
      }
    }
    setIsOn(prev => !prev);
  };

  // FIXED: Passed 'isOn' as the second argument to prevent battery drain
  useShake(() => {
    if (!checkContacts()) return;

    console.log("Collision detected! Routing to Alert Screen for 30-sec countdown.");

    // FIXED: Removed sendSMS. The Alert screen will send it if the user doesn't cancel.
    router.push("/alert");
  }, isOn);

  const openMap = () => {
    if (!coords) return;
    // FIXED: Correct Google Maps Universal Intent URL
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url);
  };

  const checkContacts = () => {
    if (!contacts || contacts.length === 0) {
      Alert.alert(
        "No Contacts Found",
        "Please add at least one trusted contact before enabling SOS mode."
      );
      return false;
    }
    return true;
  };

  return (
    <View style={[styles.container, { backgroundColor: isOn ? "#39d12f" : "#ff8a5c" }]}>

      {/* Location */}
      <TouchableOpacity style={styles.topSection} onPress={openMap}>
        <View style={styles.locationCard}>

          <View style={styles.row}>
            <Ionicons name="flash" size={18} color="#ff6b4a" />

            {/*FIXED CONTAINER */}
            <View style={styles.textContainer}>
              <Text style={styles.locationTitle}>Current location</Text>
              <Text
                style={styles.locationText}
                numberOfLines={2}   // LIMIT LINES
                ellipsizeMode="tail"
              >
                {address}
              </Text>
            </View>
          </View>

          <Ionicons name="navigate" size={18} color="#333" />
        </View>
      </TouchableOpacity>

      {/* SOS */}
      <View style={styles.centerSection}>
        <TouchableOpacity onPress={toggleSOS}
          style={styles.outerCircle}>
          <View style={[styles.innerCircle, { backgroundColor: isOn ? "#39d12f" : "#ff6b4a" }]}>
            <Text style={styles.buttonText}>{isOn ? "ON" : "OFF"}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.testButton}
        onPress={() => router.push("/alert")}
      >
        <Text style={styles.testText}>Test Alert</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100, // space for tab bar
  },

  topSection: {
    marginTop: 60,
    alignItems: "center",
    marginHorizontal: 15,
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

  textContainer: {
    marginLeft: 8,
    flex: 1,
  },

  locationCard: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  locationText: {
    fontSize: 13,
    color: "#333",
    flexShrink: 1,
  },
});