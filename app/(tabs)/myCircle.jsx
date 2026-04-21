import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
// 1. Import our new local storage service instead of Firebase
import { getLocalContacts, saveLocalContacts } from "../../services/storageService";

export default function MyCircle() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);

  // Load contacts the second the screen opens
  useEffect(() => {
    fetchContacts();
  }, []);

  // --- 1. FETCH CONTACTS (Local Storage) ---
  const fetchContacts = async () => {
    const localContacts = await getLocalContacts();
    setContacts(localContacts);
  };

  // --- 2. ADD CONTACT (Local Storage) ---
  const addContact = async () => {
    if (!name.trim() || !phone.trim()) return;

    // Create a new contact object with a unique timestamp ID
    const newContact = {
      id: Date.now().toString(), 
      name: name.trim(),
      phone: phone.trim(),
    };

    // Add it to our current list
    const updatedContacts = [...contacts, newContact];
    
    // Instantly update the UI
    setContacts(updatedContacts);
    
    // Save the new list directly to the phone's hard drive
    await saveLocalContacts(updatedContacts);

    // Clear the input boxes
    setName("");
    setPhone("");
  };

  // --- 3. DELETE CONTACT (Local Storage) ---
  const deleteContact = async (id) => {
    // Filter out the contact we want to delete
    const updatedContacts = contacts.filter((contact) => contact.id !== id);
    
    // Instantly update the UI
    setContacts(updatedContacts);
    
    // Save the new filtered list to the phone
    await saveLocalContacts(updatedContacts);
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
      />

      <TextInput
        placeholder="Phone (+91...)"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.addBtn} onPress={addContact}>
        <Text style={styles.btnText}>Add Contact</Text>
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

            <TouchableOpacity onPress={() => deleteContact(item.id)}>
              <Text style={styles.delete}>Delete</Text>
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