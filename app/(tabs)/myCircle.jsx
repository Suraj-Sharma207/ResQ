import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyCircle() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);

  const user = auth.currentUser;

  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch contacts
  const fetchContacts = async () => {
    if (!user) return;

    const snapshot = await getDocs(
      collection(db, "users", user.uid, "contacts")
    );

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setContacts(list);
  };

  // Add contact
  const addContact = async () => {
    if (!name || !phone) return;

    await addDoc(collection(db, "users", user.uid, "contacts"), {
      name,
      phone,
    });

    setName("");
    setPhone("");
    fetchContacts();
  };

  // Delete contact
  const deleteContact = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "contacts", id));
    fetchContacts();
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <Text style={styles.title}>Add Contacts</Text>

      {/*Add Contact */}
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

      {/*Contact List */}
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