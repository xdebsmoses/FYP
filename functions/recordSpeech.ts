import { Audio } from "expo-av";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Platform } from "react-native";

export const recordSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording | null>,
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  alreadyReceivedPermission: boolean
) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // 🧼 CLEANUP: stop + unload previous instance if it exists
    if (audioRecordingRef.current) {
      const status = await audioRecordingRef.current.getStatusAsync();
      if (status?.isRecording || status?.isDoneRecording) {
        await audioRecordingRef.current.stopAndUnloadAsync();
      }
      audioRecordingRef.current = null; // ✅ fully release it
    }

    // 🎤 Request mic permission if not already granted
    let permissionResponse: Audio.PermissionResponse | null = null;
    if (Platform.OS !== "web") {
      permissionResponse = await Audio.requestPermissionsAsync();
    }

    if (alreadyReceivedPermission || permissionResponse?.status === "granted") {
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: ".amr",
          outputFormat: Audio.AndroidOutputFormat.AMR_WB,
          audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await newRecording.startAsync();
      audioRecordingRef.current = newRecording; // ✅ Save the new instance
      setIsRecording(true);
    } else {
      console.error("Permission to record audio is required!");
    }
  } catch (err) {
    console.error("❌ Failed to start recording", err);
  }
};

