import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getLocalContacts, saveLocalContacts } from "../../services/storageService";

export default function MyCircle() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load contacts when the screen opens
  useEffect(() => {
    fetchContacts();
  }, []);

  // --- 1. FETCH CONTACTS (Local Storage) ---
  const fetchContacts = async () => {
    const localContacts = await getLocalContacts();
    setContacts(localContacts);
  };

  // --- 2. ADD CONTACT (Atomic Read-Modify-Write) ---
  const addContact = async () => {
    if (!name.trim() || !phone.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const current = await getLocalContacts();
      const newContact = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
      };

      const updated = [...current, newContact];
      await saveLocalContacts(updated);
      setContacts(updated);
      setName("");
      setPhone("");
    } catch (e) {
      console.error("Failed to add contact", e);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. DELETE CONTACT (Atomic Read-Modify-Write) ---
  const deleteContact = async (id) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const current = await getLocalContacts();
      const updated = current.filter((c) => c.id !== id);
      await saveLocalContacts(updated);
      setContacts(updated);
    } catch (e) {
      console.error("Failed to delete contact", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Subtle background decorative shapes matching the reference */}
      <View style={styles.decorCircleTop1} pointerEvents="none" />
      <View style={styles.decorCircleTop2} pointerEvents="none" />
      <View style={styles.decorCircleBottom} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          {/* Header section with horizontal accent line */}
          <View style={styles.header}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>Add Contacts</Text>
            <Text style={styles.subtitle}>
              Save contact details to stay connected
            </Text>
          </View>

          {/* Form section */}
          <View style={styles.formContainer}>
            {/* Name Input with icon and divider */}
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.divider} />
              <TextInput
                placeholder="Name"
                placeholderTextColor="rgba(255, 255, 255, 0.65)"
                value={name}
                onChangeText={setName}
                style={styles.textInput}
                editable={!isProcessing}
                autoCapitalize="words"
              />
            </View>

            {/* Phone Input with icon and divider */}
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.divider} />
              <TextInput
                placeholder="Phone (+91...)"
                placeholderTextColor="rgba(255, 255, 255, 0.65)"
                value={phone}
                onChangeText={setPhone}
                style={styles.textInput}
                keyboardType="phone-pad"
                editable={!isProcessing}
              />
            </View>

            {/* Add Contact Button */}
            <TouchableOpacity
              style={[styles.addBtn, isProcessing && styles.addBtnDisabled]}
              onPress={addContact}
              disabled={isProcessing}
              activeOpacity={0.88}
            >
              <Text style={styles.addBtnText}>
                {isProcessing ? "Saving..." : "Add Contact"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Saved Contacts Section */}
          {contacts.length > 0 && (
            <View style={styles.contactsSection}>
              <Text style={styles.contactsSectionTitle}>
                Saved Contacts ({contacts.length})
              </Text>
              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <View style={styles.contactCard}>
                    <View style={styles.avatarMini}>
                      <Ionicons name="person" size={16} color="#ff7043" />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => deleteContact(item.id)}
                      disabled={isProcessing}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color="rgba(255, 255, 255, 0.9)"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ff7043", // Warm coral-orange matching the reference image
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
  },

  // Subtle background watermark shapes
  decorCircleTop1: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 32,
    borderColor: "rgba(255, 255, 255, 0.07)",
  },
  decorCircleTop2: {
    position: "absolute",
    top: 75,
    right: 45,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  decorCircleBottom: {
    position: "absolute",
    bottom: 80,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 28,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  // Header styles
  header: {
    marginBottom: 24,
  },
  accentBar: {
    width: 44,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    opacity: 0.95,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.88)",
    fontWeight: "400",
    lineHeight: 20,
  },

  // Form styles
  formContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.55)",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  iconContainer: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 10,
  },
  textInput: {
    flex: 1,
    height: "100%",
    color: "#ffffff",
    fontSize: 15,
    paddingVertical: 0,
  },

  // Add Contact Button
  addBtn: {
    backgroundColor: "#ffffff",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  addBtnDisabled: {
    opacity: 0.75,
  },
  addBtnText: {
    color: "#262626",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Contacts List Section
  contactsSection: {
    flex: 1,
    marginTop: 10,
  },
  contactsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  listContent: {
    paddingBottom: 110, // Prevents bottom floating tab bar from obscuring items
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  contactPhone: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
});