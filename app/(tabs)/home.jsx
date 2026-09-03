import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState, useEffect, useRef } from "react";
import { 
  Alert, 
  Animated,
  Linking, 
  PermissionsAndroid, 
  Platform, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLocation from "../../hooks/useLocation";
import useShake from "../../hooks/useShake";
import { getLocalContacts } from "../../services/storageService";
import { 
  setupBackgroundService, 
  startSOSBackgroundMode, 
  stopSOSBackgroundMode 
} from "../../services/backgroundService";
import useNativeShake from "../../hooks/useNativeShake";
import UserGuideModal from "../../components/UserGuideModal";


export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const { address, coords } = useLocation(isOn);
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [guideVisible, setGuideVisible] = useState(true);

  // 1 = expanded ("How it works ?"), 0 = collapsed ("?")
  const guideCollapseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Keep expanded for 3 seconds, then smoothly animate text into the ? button
    const collapseTimer = setTimeout(() => {
      Animated.timing(guideCollapseAnim, {
        toValue: 0,
        duration: 550,
        useNativeDriver: false,
      }).start();
    }, 3000);

    return () => clearTimeout(collapseTimer);
  }, []);

  useEffect(() => {
    setupBackgroundService();

    const checkGuidePref = async () => {
      try {
        const seen = await AsyncStorage.getItem("@resq_user_guide_seen");
        if (seen === "true") {
          setGuideVisible(false);
        }
      } catch (e) {
        console.error("Error reading guide state", e);
      }
    };
    checkGuidePref();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchContacts = async () => {
        const localContacts = await getLocalContacts();
        setContacts(localContacts);
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
      startSOSBackgroundMode();
    }else{
      stopSOSBackgroundMode();
    }
    setIsOn(prev => !prev);
  };

  // Passed 'isOn' as the second argument to prevent battery drain
  useNativeShake(() => {
    if (!checkContacts()) return;

    console.log("Collision detected! Routing to Alert Screen for 30-sec countdown.");

    router.push("/alert");
  }, isOn);

  const openMap = () => {
    if (!coords) return;
    // Google Maps Universal Intent URL
    const url = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
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

  const animatedTextWidth = guideCollapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 96],
  });

  const animatedTextOpacity = guideCollapseAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1],
  });

  const animatedPaddingRight = guideCollapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 12],
  });

  return (
    <View style={[styles.container, { backgroundColor: isOn ? "#39d12f" : "#ff8a5c" }]}>

      {/* Location & Guide Header */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.locationCard} onPress={openMap} activeOpacity={0.85}>
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
        </TouchableOpacity>

        {/* Guide Button aligned perfectly to the right edge of locationCard */}
        <View style={styles.guideButtonContainer}>
          <TouchableOpacity
            onPress={() => setGuideVisible(true)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.guideButton, { paddingRight: animatedPaddingRight }]}>
              <Ionicons name="help-circle" size={20} color="#fff" />
              <Animated.View
                style={{
                  width: animatedTextWidth,
                  opacity: animatedTextOpacity,
                  overflow: "hidden",
                  justifyContent: "center",
                }}
              >
                <Text style={styles.guideButtonText} numberOfLines={1}>
                  How it works ?
                </Text>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

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

      {/* User Manual & Safety Guide Pop-up */}
      <UserGuideModal
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
      />

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
    width: "100%",
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

  guideButtonContainer: {
    width: "90%",
    alignItems: "flex-end",
    marginTop: 8,
  },

  guideButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingLeft: 6,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  guideButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 5,
    width: 95,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  locationTitle: { fontSize: 12, color: "#777" },
  locationText: { fontSize: 13, color: "#333", flexShrink: 1 },

  textContainer: {
    marginLeft: 8,
    flex: 1,
  },

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