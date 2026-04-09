import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db, storage } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProfile() {
  const [userData, setUserData] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setUserData(snap.data());
  };

  // Pick Image
  const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Permission required");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images, // ✅ correct
            quality: 0.7,
        });

        if (!result.canceled) {
            setUserData({
            ...userData,
            photo: result.assets[0].uri,
            });
        }
    };

  // Save Profile
    const handleSave = async () => {
        try {
            const user = auth.currentUser;

            let imageUrl = userData.photo || "";

            // Upload only if it's local image
            if (userData.photo && userData.photo.startsWith("file")) {
            imageUrl = await uploadImage(userData.photo);
            }

            await setDoc(doc(db, "users", user.uid), {
            ...userData,
            photo: imageUrl,
            });

            Alert.alert("Profile Updated");
            router.back();
        } catch (e) {
            console.log(e);
        }
        };

    const uploadImage = async (uri) => {
    const data = new FormData();

        data.append("file", {
            uri,
            type: "image/jpeg",
            name: "profile.jpg",
        });

        data.append("upload_preset", "ml_default"); // default preset
        data.append("cloud_name", "dq4wkqzme"); // replace this

        try {
            const res = await fetch(
            "https://api.cloudinary.com/v1_1/dq4wkqzme/image/upload",
            {
                method: "POST",
                body: data,
            }
            );

            const result = await res.json();

            return result.secure_url; // 🔥 this is your image URL
        } catch (err) {
            console.log("Upload Error:", err);
        }
    };

  return (
    <LinearGradient colors={["#fd8e63","#ff5f5f"]} style={styles.container}>
      <ScrollView>

        {/* Profile Image */}
        <TouchableOpacity onPress={pickImage} style={styles.center}>
          <Image
            source={{
              uri:
                userData.photo ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
          <Text style={{ color: "white" }}>Change Photo</Text>
        </TouchableOpacity>

        {/* Inputs */}
        <View style={styles.card}>
          <Text>Name</Text>
          <TextInput
            value={userData.name}
            onChangeText={(text) => setUserData({ ...userData, name: text })}
            style={styles.input}
          />

          <Text>Phone</Text>
          <TextInput
            value={userData.phone}
            onChangeText={(text) => setUserData({ ...userData, phone: text })}
            style={styles.input}
          />

          <Text>Blood Group</Text>
          <TextInput
            value={userData.bloodGroup}
            onChangeText={(text) =>
              setUserData({ ...userData, bloodGroup: text })
            }
            style={styles.input}
          />

          <Text>Allergies</Text>
          <TextInput
            value={userData.allergies}
            onChangeText={(text) =>
              setUserData({ ...userData, allergies: text })
            }
            style={styles.input}
          />

          <Text>Emergency Note</Text>
          <TextInput
            value={userData.note}
            onChangeText={(text) => setUserData({ ...userData, note: text })}
            style={styles.input}
          />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    alignItems: "center",
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#0f56da",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
});