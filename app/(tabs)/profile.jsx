import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { db, auth } from "../../config/firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setUserData(snapshot.data());
      } else {
        //CREATE PROFILE AUTOMATICALLY
        const newUser = {
          name: "",
          email: user.email,
          phone: "",
          photo: "",
          bloodGroup: "",
          allergies: "",
          note: "",
        };

        await setDoc(docRef, newUser); // create in firestore
        setUserData(newUser); // set locally
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out successfully");
      router.replace("/login"); // redirect to login
    } catch (error) {
      console.log(error);
    }
  };

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text>Profile Loading...</Text>
      </View>
    );
  }

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