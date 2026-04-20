import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import { Alert, Linking, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebase";
import useAuth from "../../hooks/useAuth";
import useLocation from "../../hooks/useLocation";
import useShake from "../../hooks/useShake"; // Or useSmartCrashDetection if you swapped it
// Note: Removed sendSMS import from here since the Alert screen handles it now!

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
    <SafeAreaView style={styles.container}>

      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: userData.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{userData.name || "User Name"}</Text>
      </View>

      {/* Basic Info */}
      <View style={styles.card}>
        <Text style={styles.title}>Basic Info</Text>
        <Text>{userData.email}</Text>
        <Text>{userData.phone || "Add Number"}</Text>
      </View>

      {/*Emergency Info */}
      <View style={styles.card}>
        <Text style={styles.title}>Emergency Info</Text>
        <Text>Blood Group: {userData.bloodGroup || ""}</Text>
        <Text>Allergies: {userData.allergies || ""}</Text>
        <Text>Note: {userData.note || ""}</Text>
      </View>

      {/* Contacts */}
      <View style={styles.card}>
        <Text style={styles.title}>Trusted Contacts</Text>
        <TouchableOpacity
          onPress={() => router.push("/myCircle")}
          style={styles.smallBtn}
        >
          <Text style={styles.btnText}>Manage Contacts</Text>
        </TouchableOpacity>
      </View>

      {/*Logout*/}
      <View style={styles.buttonRow}>
        {/* Edit Profile */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#0f56da" }]}
          onPress={() => router.push("/editProfile")}>
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#ff0000" }]}
          onPress={handleLogout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ff8a5c",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  smallBtn: {
    marginTop: 10,
    backgroundColor: "#0f56da",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  logoutText: {
    color: "white",
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,

  },

  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 2,

  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});