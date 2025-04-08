import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "../firebaseconfig";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<{ name: string; phone: string }[]>([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [triggerWords, setTriggerWords] = useState("");

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
          setTriggerWords((data.triggerWords || []).join(", "));
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
        triggerWords: triggerWords.split(",").map((word) => word.trim()),
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
    <SafeAreaView style={styles.safeArea}>
      {/* 🔙 Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Your <Text style={styles.accent}>Profile</Text></Text>
        <View style={{ width: 24 }} />
      </View>

      {/* FlatList as main container */}
      <FlatList
        data={emergencyContacts}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />

            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>{item.name} - {item.phone}</Text>
            <TouchableOpacity onPress={() => removeContact(index)}>
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <>
            <TextInput
              style={styles.input}
              value={newContact.name}
              placeholder="Contact Name"
              placeholderTextColor="#888"
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            />
            <TextInput
              style={styles.input}
              value={newContact.phone}
              placeholder="Contact Phone"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            />
            <TouchableOpacity style={styles.button} onPress={addEmergencyContact}>
              <Text style={styles.buttonText}>Add Contact</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Trigger Words</Text>
            <TextInput
              style={styles.input}
              value={triggerWords}
              placeholder="e.g. help, danger, emergency"
              placeholderTextColor="#888"
              onChangeText={setTriggerWords}
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteBtn]} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Delete My Account</Text>
            </TouchableOpacity>
          </>
        }
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B141E",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#19232F",
    borderBottomWidth: 1,
    borderBottomColor: "#0B141E",
  },
  navTitle: {
    fontSize: 20,
    fontFamily: "Poppins",
    color: "#fff",
  },
  accent: {
    color: "#00FFFF",
  },
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    fontFamily: "Poppins",
  },
  input: {
    backgroundColor: "#19232F",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins",
    borderColor: "#00FFFF",
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    color: "#00FFFF",
    fontFamily: "Poppins",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#19232F",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactText: {
    color: "#fff",
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#00FFFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#000",
  },
  deleteBtn: {
    backgroundColor: "transparent",
    borderColor: "red",
    borderWidth: 1,
  },
  deleteText: {
    color: "red",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
});

export default Profile;