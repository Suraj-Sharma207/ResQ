import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { getLocalContacts, getLocalProfile } from "../../services/storageService";

export default function Profile() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [userData, setUserData] = useState({});

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const localProfile = await getLocalProfile();
        if (localProfile) setUserData(localProfile);

        const localContacts = await getLocalContacts();
        setContacts(localContacts);
      };

      fetchData();
    }, [])
  );

  return (
    // 1. WRAPPED ENTIRE SCREEN IN A GRADIENT
    <LinearGradient 
      colors={["#ffbd7e", "#ff6b3d"]} 
      style={styles.container}
    >
      {/* Set edges to ignore bottom safe area so the gradient goes behind tabs */}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent} // Moved padding here
        >
          
          {/* --- PREMIUM AVATAR HEADER --- */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: userData.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                style={styles.avatar}
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.name}>{userData.name || "ResQ User"}</Text>
              <Text style={styles.tagline}>Safety Profile</Text>
            </View>
          </View>

          {/* --- BASIC INFO CARD --- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={24} color="#ff8a5c" />
              <Text style={styles.title}>Parents Details</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{userData.phone || "Not set"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{userData.address || "Not set"}</Text>
            </View>
          </View>

          {/* --- MEDICAL INFO CARD --- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="medical-outline" size={24} color="#ff0000" />
              <Text style={styles.title}>Medical Info</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={[styles.value, { color: "#ff0000", fontWeight: "900" }]}>
                {userData.bloodGroup || "-"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Allergies</Text>
              <Text style={styles.value}>{userData.allergies || "None"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{userData.note || "No additional medical notes."}</Text>
            </View>
          </View>

          {/* --- TRUSTED CONTACTS CARD --- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#0f56da" />
              <Text style={styles.title}>Emergency Network</Text>
            </View>
            
            <View>
              <Text style={styles.contactCount}>
                You have {contacts.length} trusted contact(s) active.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.manageBtn} 
              onPress={() => router.push("/myCircle")}
            >
              <Ionicons name="people-outline" size={20} color="white" />
              <Text style={styles.manageBtnText}>Manage Contacts</Text>
            </TouchableOpacity>
          </View>

          {/* --- BOTTOM ACTION BUTTON --- */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/editProfile")}
          >
            <Ionicons name="pencil-outline" size={20} color="#ff8a5c" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

           
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20, // Moved padding here so scrollbar touches edge
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 60,
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  name: {
    fontSize: 26,
    fontWeight: "900",
    color: "white",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    
    // 3. FIXED ELEVATION: Softer, more modern shadows
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: "#777",
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: "#222",
    fontWeight: "bold",
    flexShrink: 1,
    textAlign: "right",
    paddingLeft: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#f4f4f4", // Lighter divider color
    marginVertical: 4,
  },
  contactCount: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  manageBtn: {
    backgroundColor: "#0f56da",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  manageBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  editBtn: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 20,
    
    // Matched the button shadow to the card shadow
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  editBtnText: {
    color: "#ff8a5c",
    fontWeight: "900",
    fontSize: 16,
    marginLeft: 8,
    textTransform: "uppercase",
  },
});