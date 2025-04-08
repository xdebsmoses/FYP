import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { recordSpeech } from "../functions/recordSpeech";
import { transcribeSpeech, saveTranscriptToFirestore, checkTriggerWords } from "../functions/transcribeSpeech";
import { notifyEmergencyContacts } from "../functions/notifications";
import { auth } from "../firebaseconfig";

export default function SpeakScreen() {
  const audioRecordingRef = useRef<Audio.Recording | null>(new Audio.Recording());

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  // 🔘 Start or stop recording
  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsLoading(true);

      const transcript = await transcribeSpeech(audioRecordingRef);

      if (transcript) {
        await saveTranscriptToFirestore(transcript);

        const triggerDetected = await checkTriggerWords(transcript);

        if (triggerDetected) {
          Alert.alert(
            "⚠️ Trigger Word Detected",
            "Contacting your emergency contacts...",
            [{ text: "OK" }]
          );
          await notifyEmergencyContacts();
        }
      }

      setIsLoading(false);
    } else {
      await recordSpeech(audioRecordingRef, setIsRecording, false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔙 Navbar */}
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navIcon}>
          <Ionicons name="arrow-back-outline" size={24} color="#00FFFF" />
        </Pressable>
        <Text style={styles.navTitle}>
          Virtual <Text style={styles.accent}>Listening</Text>
        </Text>
        <View style={{ width: 24 }} /> {/* Spacer for symmetry */}
      </View>

      {/* 🎙️ Center Display */}
      <View style={styles.content}>
       <Text style={styles.heading}>🎙️ Tap the mic to start listening</Text>

        <Pressable
          style={[styles.recordButton, isRecording && styles.recording]}
          onPress={handleRecordToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="mic" size={40} color="#fff" />
          )}
        </Pressable>

        <Text style={styles.statusText}>
          {isRecording
            ? "Listening..."
            : isLoading
            ? "Processing..."
            : "Press to begin"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// 🖌️ Styles
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
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: "#19232F",
    borderBottomWidth: 1,
    borderBottomColor: "#0B141E",
  },
  navIcon: {
    padding: 4,
  },
  navTitle: {
    fontSize: 20,
    fontFamily: "Poppins",
    color: "#fff",
  },
  accent: {
    color: "#00FFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: "#fff",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Poppins",
  },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  recording: {
    backgroundColor: "darkred",
  },
  statusText: {
    marginTop: 20,
    color: "#aaa",
    fontSize: 16,
    fontFamily: "Poppins",
  },
});