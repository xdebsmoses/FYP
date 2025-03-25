import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { recordSpeech } from "../functions/recordSpeech";
import { auth } from "../firebaseconfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { transcribeSpeech, saveTranscriptToFirestore, checkTriggerWords } from "../functions/transcribeSpeech";
import { notifyEmergencyContacts } from "../functions/notifications";
import { Ionicons } from "@expo/vector-icons";

const SpeakScreen = () => {
  const audioRecordingRef = useRef<Audio.Recording | null>(new Audio.Recording());
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Define trigger words
  const TRIGGER_WORDS = ["help", "emergency", "danger", "i'm scared"];

  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsLoading(true);
  
      console.log("🎙️ Stopping recording and transcribing...");
      const text = await transcribeSpeech(audioRecordingRef);
      console.log("📄 Transcribed text:", text);
  
      if (text) {
        setTranscript(text);
        await saveTranscriptToFirestore(text);
        console.log("✅ Transcript saved to Firestore");
  
        const hasTrigger = await checkTriggerWords(text);
        console.log("🚨 Trigger detected:", hasTrigger);
        
        if (hasTrigger) {
          await notifyEmergencyContacts();
        }
      }
  
      setIsLoading(false);
    } else {
      await recordSpeech(audioRecordingRef, setIsRecording, false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to the{"\n"}Speech-to-Text App</Text>

      <TextInput
        style={styles.transcriptBox}
        multiline
        value={transcript}
        placeholder="Your transcribed text will be shown here"
        editable={false}
        placeholderTextColor="#888"
      />

      <Pressable
        style={[styles.recordButton, isRecording && styles.recording]}
        onPress={handleRecordToggle}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="mic" size={32} color="#fff" />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  transcriptBox: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#eee",
    fontSize: 16,
    color: "#333",
  },
  recordButton: {
    marginTop: 30,
    backgroundColor: "red",
    padding: 20,
    borderRadius: 50,
    elevation: 4,
  },
  recording: {
    backgroundColor: "darkred",
  },
});

export default SpeakScreen;