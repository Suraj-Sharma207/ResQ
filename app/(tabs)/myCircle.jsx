import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
// 1. Import our new local storage service instead of Firebase
import { getLocalContacts, saveLocalContacts } from "../../services/storageService";

export default function MyCircle() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load contacts the second the screen opens
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
      // Atomic read: get freshest persistent list before appending
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
      // Atomic read: get freshest persistent list before filtering
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
    <SafeAreaView style={styles.container}>
      
      <Text style={styles.title}>Add Contacts</Text>

      {/* Add Contact */}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        editable={!isProcessing}
      />

      <TextInput
        placeholder="Phone (+91...)"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        editable={!isProcessing}
      />

      <TouchableOpacity 
        style={[styles.addBtn, isProcessing && { opacity: 0.6 }]} 
        onPress={addContact}
        disabled={isProcessing}
      >
        <Text style={styles.btnText}>
          {isProcessing ? "Saving..." : "Add Contact"}
        </Text>
      </TouchableOpacity>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>

            <TouchableOpacity 
              onPress={() => deleteContact(item.id)}
              disabled={isProcessing}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.delete, isProcessing && { opacity: 0.5 }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

    </SafeAreaView>
  );
}

// Keep your existing styles exactly as they are!
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ff8a5c",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#272424",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: {
    color: "#020202",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  phone: {
    color: "#555",
  },
  delete: {
    color: "red",
    fontWeight: "bold",
  },
});