// app/HomeScreen.tsx
import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

// If you're not using `react-native-safe-area-context`, 
// you can import SafeAreaView from 'react-native' 
// but that only affects iOS. The 'react-native-safe-area-context'
// approach works on both iOS and Android.

type ScreenRoute =
  | "/Profile"
  | "/Community"
  | "/chatbot"
  | "/maps"
  | "/GroupChatListPage"
  | "/SpeakScreen"
  | "/Login"
  | "/FeedbackScreen"

export default function HomeScreen() {
  const router = useRouter()

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => router.push("/Login") },
    ])
  }

  const navigateTo = (screen: ScreenRoute) => {
    router.push(screen)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigateTo("/Profile")} style={styles.navIcon}>
          <Ionicons name="person-circle-outline" size={28} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          <Text>CARE </Text>
          <Text style={styles.accent}>Dashboard</Text>
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.navIcon}>
          <Ionicons name="log-out-outline" size={28} color="#00FFFF" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Welcome to CARE</Text>
        <Text style={styles.subtitle}>Companion App for Real-Time Emergencies</Text>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.card} onPress={() => navigateTo("/Community")}>
              <Ionicons name="megaphone-outline" size={32} color="#00FFFF" />
              <Text style={styles.cardText}>Community Reporting</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigateTo("/chatbot")}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color="#00FFFF" />
              <Text style={styles.cardText}>AI Safety Chatbot</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.card} onPress={() => navigateTo("/maps")}>
              <Ionicons name="map-outline" size={32} color="#00FFFF" />
              <Text style={styles.cardText}>Safe Route Finder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigateTo("/GroupChatListPage")}>
              <Ionicons name="people-outline" size={32} color="#00FFFF" />
              <Text style={styles.cardText}>Group Chats</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.card} onPress={() => navigateTo("/SpeakScreen")}>
              <Ionicons name="ear-outline" size={32} color="#00FFFF" />
              <Text style={styles.cardText}>Virtual Listening</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Link */}
        <TouchableOpacity onPress={() => navigateTo("/FeedbackScreen")} style={styles.feedbackLink}>
          <Text style={styles.feedbackText}>Submit Feedback</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B141E",
  },
  navTitle: {
    fontSize: 20,
    fontFamily: "Poppins",
    color: "#fff",
  },
  navIcon: {
    padding: 4,
  },
  accent: {
    color: "#00FFFF",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#19232F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginTop: 20,
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#cccccc",
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 20,
  },
  cardsContainer: {
    width: "100%",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#19232F",
    width: 150,
    height: 150,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Poppins",
  },
  feedbackLink: {
    marginTop: 30,
    paddingVertical: 10,
  },
  feedbackText: {
    color: "#00FFFF",
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: "Poppins",
  },
})