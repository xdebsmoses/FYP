import { Audio } from "expo-av";
import { auth } from "../firebaseconfig";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { MutableRefObject } from "react";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { readBlobAsBase64 } from "./readBlobAsBase64";

const firestore = getFirestore();

interface SpeechToTextResponse {
  results?: {
    alternatives?: {
      transcript: string;
      confidence?: number;
    }[];
  }[];
}

export const transcribeSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording | null>
): Promise<string | undefined> => {
  try {
    if (!audioRecordingRef.current) return;

    await audioRecordingRef.current.stopAndUnloadAsync();
    const uri = audioRecordingRef.current.getURI();
    if (!uri) return;

    let base64Audio = "";
    if (Platform.OS === "web") {
      const blob = await fetch(uri).then((res) => res.blob());
      const result = (await readBlobAsBase64(blob)) as string;
      base64Audio = result.split("base64,")[1];
    } else {
      base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    audioRecordingRef.current = new Audio.Recording();

    const audioConfig = {
      encoding:
        Platform.OS === "android"
          ? "AMR_WB"
          : Platform.OS === "web"
          ? "WEBM_OPUS"
          : "LINEAR16",
      sampleRateHertz:
        Platform.OS === "android"
          ? 16000
          : Platform.OS === "web"
          ? 48000
          : 41000,
      languageCode: "en-US",
    };

    //const LOCAL_IP = "172.20.10.2"; INTERNET IP
    // hotsop ip
    const LOCAL_IP = "172.20.10.2";
    const serverUrl = `http://${LOCAL_IP}:4000/speech-to-text`;

    const response = await fetch(serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl: base64Audio, config: audioConfig }),
    });

    const result = (await response.json()) as SpeechToTextResponse;

    const transcript = result?.results?.[0]?.alternatives?.[0]?.transcript;
    return transcript;
  } catch (error) {
    console.error("Transcription failed:", error);
    return undefined;
  }
};

// Save transcript to Firestore
export const saveTranscriptToFirestore = async (transcript: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(firestore, "users", user.uid);
  await setDoc(
    userRef,
    {
      lastTranscript: transcript,
      lastUpdated: Date.now(),
    },
    { merge: true }
  );
};

export const checkTriggerWords = async (text: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const userRef = doc(firestore, "users", user.uid);
  const docSnap = await getDoc(userRef);
  const lower = text.toLowerCase();

  if (docSnap.exists()) {
    const userData = docSnap.data();
    const triggerWords: string[] = userData.triggerWords || [];
    return triggerWords.some((word) => lower.includes(word.toLowerCase()));
  }

  return false;
};