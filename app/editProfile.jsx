import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

// Import our completely offline storage service
import { getLocalProfile, saveLocalProfile } from "../services/storageService";

export default function EditProfile() {
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    note: "",
    photo: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const profile = await getLocalProfile();
      if (profile) setUserData(profile);
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setUserData({
        ...userData,
        photo: result.assets[0].uri,
      });
    }
  };

  const handleSave = async () => {
    if (!userData.name.trim() || !userData.phone.trim()) {
      Alert.alert("Required Fields", "Please provide a Name and Phone Number.");
      return;
    }

    try {
      await saveLocalProfile(userData);
      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not save profile.");
    }
  };

  return (
    <LinearGradient 
      colors={["#ffbd7e", "#ff6b3d"]} 
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <View style={{ width: 24 }}></View>
            </View>

            <View style={styles.center}>
              <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                <Image
                  source={{
                    uri: userData.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={18} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
                  <TextInput
                    value={userData.name}
                    onChangeText={(text) => setUserData({ ...userData, name: text })}
                    style={styles.input}
                    placeholder="Eg: Suraj"
                    placeholderTextColor="#d4d4d4"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <View style={styles.inputWrapper}>
                  {/* FIXED: Changed icon to location-outline */}
                  <Ionicons name="location-outline" size={20} color="#777" style={styles.inputIcon} />
                  <TextInput
                    value={userData.address}
                    /* FIXED: Now correctly updates 'address' instead of 'name' */
                    onChangeText={(text) => setUserData({ ...userData, address: text })}
                    style={styles.input}
                    placeholder="eg: Asansol, WB"
                    placeholderTextColor="#d4d4d4"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parent Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#777" style={styles.inputIcon} />
                  <TextInput
                    value={userData.phone}
                    onChangeText={(text) => setUserData({ ...userData, phone: text })}
                    style={styles.input}
                    placeholder="+91..."
                    keyboardType="phone-pad"
                    placeholderTextColor="#d4d4d4"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood Group</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="water-outline" size={20} color="#ff0000" style={styles.inputIcon} />
                  <TextInput
                    value={userData.bloodGroup}
                    onChangeText={(text) => setUserData({ ...userData, bloodGroup: text })}
                    style={styles.input}
                    placeholder="O+, A-, etc."
                    placeholderTextColor="#d4d4d4"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Allergies</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="leaf-outline" size={20} color="#777" style={styles.inputIcon} />
                  <TextInput
                    value={userData.allergies}
                    onChangeText={(text) => setUserData({ ...userData, allergies: text })}
                    style={styles.input}
                    placeholder="Dust, Peanuts..."
                    placeholderTextColor="#d4d4d4"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Note</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text-outline" size={20} color="#777" style={styles.inputIcon} />
                  <TextInput
                    placeholderTextColor="#d4d4d4"
                    value={userData.note}
                    onChangeText={(text) => setUserData({ ...userData, note: text })}
                    style={styles.input}
                    placeholder="Any extra medical info..."
                    multiline
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>

            </View>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  center: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "#ddd",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 5,
    backgroundColor: "#0f56da",
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#ff8a5c",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  saveBtn: {
    backgroundColor: "#0f56da",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
    textTransform: "uppercase",
  },
});