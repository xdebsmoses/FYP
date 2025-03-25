import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, StyleSheet } from "react-native";
import { auth, firestore } from "../firebaseconfig";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";

const Profile = () => {
  const user = auth.currentUser;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<{ name: string; phone: string }[]>([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setEmergencyContacts(data.emergencyContacts || []);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        email: user.email,
        phone,
        emergencyContacts,
      });
      Alert.alert("Success", "Profile updated.");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Could not save profile.");
    }
  };

  const addEmergencyContact = () => {
    if (!newContact.name || !newContact.phone) return;
    setEmergencyContacts([...emergencyContacts, newContact]);
    setNewContact({ name: "", phone: "" });
  };

  const removeContact = (index: number) => {
    const updated = [...emergencyContacts];
    updated.splice(index, 1);
    setEmergencyContacts(updated);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(firestore, "users", user.uid));
      await deleteUser(user);
      Alert.alert("Account deleted", "We're sorry to see you go.");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Could not delete account.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Profile</Text>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />

      <Text style={styles.sectionTitle}>Emergency Contacts</Text>
      <FlatList
        data={emergencyContacts}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.contactItem}>
            <Text>{item.name} - {item.phone}</Text>
            <Button title="Remove" onPress={() => removeContact(index)} />
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        value={newContact.name}
        placeholder="Contact Name"
        onChangeText={(text) => setNewContact({ ...newContact, name: text })}
      />
      <TextInput
        style={styles.input}
        value={newContact.phone}
        placeholder="Contact Phone"
        keyboardType="phone-pad"
        onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
      />
      <Button title="Add Contact" onPress={addEmergencyContact} />

      <Button title="Save Changes" onPress={handleSave} />
      <Button title="Delete My Account" onPress={handleDeleteAccount} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  contactItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
});

export default Profile;