import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigation } from "@react-navigation/native";

// -- IMPORTANT: Keep your actual keys in a secure file/environment variable.
const API_KEY = "AIzaSyAMr1uOSFSw7U4EXTODbXJHfpbt4Kxgg3A";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  const generateAIResponse = async (userMessage: string) => {
    try {
      const prompt = `Respond in English: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error("Gemini error:", err);
      return "Sorry, I couldn't generate a response.";
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    const aiText = await generateAIResponse(userMessage.text);

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-ai`, text: aiText, isUser: false },
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
      ]}
    >
      {/* Robot Icon only for bot messages */}
      {!item.isUser && (
        <Image source={require("../assets/robot.png")} style={styles.robotIcon} />
      )}
      <Text style={item.isUser ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navIcon}
        >
          <Ionicons name="arrow-back-outline" size={26} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          CARE <Text style={styles.accent}>Chatbot</Text>
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Keyboard Avoiding Wrapper */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* [ADDITION] Brief Explanation / Guide */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Welcome to the CARE Chatbot! Here, you can ask questions about personal
            safety, request emotional support, or explore Bible verses for comfort.
            For example, try asking:
          </Text>
          <Text style={styles.exampleText}>• "How can I stay safe when walking alone at night?"</Text>
          <Text style={styles.exampleText}>• "Please give me a comforting Bible verse."</Text>
          <Text style={styles.exampleText}>• "What should I do if I feel I’m being followed?"</Text>
        </View>

        {/* Chat List */}
        <FlatList
          ref={scrollRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <ActivityIndicator color="#00FFFF" style={{ marginVertical: 8 }} />
        )}

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B141E",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#19232F",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#0B141E",
  },
  navTitle: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Poppins",
  },
  accent: {
    color: "#00FFFF",
  },
  navIcon: {
    padding: 4,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: "#00FFFF",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#19232F",
    alignSelf: "flex-start",
  },
  userText: {
    color: "#000",
    fontFamily: "Poppins",
  },
  botText: {
    color: "#fff",
    fontFamily: "Poppins",
    marginLeft: 8,
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19232F",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#0B141E",
  },
  input: {
    flex: 1,
    backgroundColor: "#0B141E",
    borderColor: "#00FFFF",
    borderWidth: 1,
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontFamily: "Poppins",
  },
  sendBtn: {
    backgroundColor: "#00FFFF",
    marginLeft: 10,
    padding: 10,
    borderRadius: 10,
  },
  robotIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  // [ADDITION] Additional styling for the info area
  infoContainer: {
    backgroundColor: "#19232F",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0B141E",
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins",
    marginBottom: 6,
    lineHeight: 20,
  },
  exampleText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 8,
    fontFamily: "Poppins",
    lineHeight: 20,
  },
});