import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => router.push("/Login") }, 
    ]);
  };

  const navigateToCommunity = () => {
    setMenuVisible(false); // Close dropdown
    router.push("/Community"); // Navigate to Community page
  };

  const navigateToMaps = () => {
    setMenuVisible(false); // Close dropdown
    router.push("/maps"); // Navigate to Community page
  };

  const navigateToSpeak = () => {
    setMenuVisible(false); // Close dropdown
    router.push("/SpeakScreen"); // Navigate to Community page
  };

  const navigateToChat = () => {
    setMenuVisible(false); // Close dropdown
    router.push("/GroupChatListPage"); // Navigate to Community page
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Welcome to CARE</Text>
      <Text style={styles.subtitle}>Companion App for Real-Time Emergencies</Text>

      {/* ☰ Navigation Button */}
      <TouchableOpacity style={styles.navButton} onPress={() => setMenuVisible(!menuVisible)}>
        <Text style={styles.navButtonText}>☰</Text>
      </TouchableOpacity>

      {/* 📌 Dropdown Menu */}
      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToCommunity}>
            <Text style={styles.menuText}>Community</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToMaps}>
            <Text style={styles.menuText}>Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToChat}>
            <Text style={styles.menuText}>Group Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToSpeak}>
            <Text style={styles.menuText}>Speak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  navButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#007bff",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  dropdownMenu: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    padding: 10,
  },
  menuText: {
    fontSize: 16,
    color: "#007bff",
  },
});