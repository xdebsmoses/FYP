import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestore, auth } from "../firebaseconfig";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { useRoute, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: number;
  addedToReports: boolean;
  postcode?: string;
}

type ChatItem =
  | { type: "date"; date: string }
  | (Message & { type?: "message" });

const isDateItem = (item: ChatItem): item is { type: "date"; date: string } => {
  return item.type === "date";
};

export default function ChatRoomPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const { chatId, chatName } = route.params as { chatId: string; chatName: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [addToReports, setAddToReports] = useState(false);
  const [shareEmail, setShareEmail] = useState(true);
  const [postcode, setPostcode] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchUser = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser.email || "Anonymous");
      }
    };

    const fetchMessages = () => {
      const messagesRef = collection(firestore, `group_chats/${chatId}/messages`);
      const q = query(messagesRef, orderBy("timestamp"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chatMessages: Message[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Message),
          id: doc.id,
        }));
        setMessages(chatMessages);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });
      return unsubscribe;
    };

    fetchUser();
    const unsubscribe = fetchMessages();
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!messageText.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    if (addToReports && !postcode.trim()) {
      alert("Please enter a postcode for the report.");
      return;
    }

    const messageData: any = {
      text: messageText.trim(),
      user: shareEmail ? user : "Anonymous",
      timestamp: Date.now(),
      addedToReports: addToReports,
    };

    if (addToReports) {
      messageData.postcode = postcode.trim();
    }

    try {
      await addDoc(collection(firestore, `group_chats/${chatId}/messages`), messageData);

      if (addToReports) {
        await addDoc(collection(firestore, "community_reports"), {
          message: messageText.trim(),
          user: shareEmail ? user : "Anonymous",
          timestamp: Date.now(),
          postcode: postcode.trim(),
        });
      }

      setMessageText("");
      setAddToReports(false);
      setPostcode("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(firestore, `group_chats/${chatId}/messages/${messageId}`));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const groupMessagesByDate = (messages: Message[]): ChatItem[] => {
    const grouped: { [date: string]: Message[] } = {};

    messages.forEach((msg) => {
      const date = format(new Date(msg.timestamp), "MMMM d, yyyy");
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });

    const chatItems: ChatItem[] = [];
    Object.keys(grouped).forEach((date) => {
      chatItems.push({ type: "date", date });
      grouped[date].forEach((msg) => chatItems.push({ ...msg, type: "message" }));
    });

    return chatItems;
  };

  const chatItems = groupMessagesByDate(messages);

  const renderItem = ({ item }: { item: ChatItem }) => {
    if (isDateItem(item)) {
      return <Text style={styles.dateLabel}>{item.date}</Text>;
    }

    const isUser = item.user === user;
    return (
      <View style={[styles.messageItem, isUser && { alignItems: "flex-end" }]}>
        <Text style={styles.user}>{item.user}</Text>
        <View style={styles.bubbleRow}>
          <View style={[styles.bubble, isUser && styles.userBubble]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timeText}>{format(new Date(item.timestamp), "h:mm a")}</Text>
          </View>
          {isUser && (
            <TouchableOpacity onPress={() => deleteMessage(item.id)} style={styles.trashIcon}>
              <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{chatName}</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={chatItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          placeholderTextColor="#888"
          value={messageText}
          onChangeText={setMessageText}
        />
        <View style={styles.switchRow}>
          <Switch value={addToReports} onValueChange={setAddToReports} />
          <Text style={styles.switchLabel}>Add to Reports</Text>
        </View>
        {addToReports && (
          <TextInput
            style={styles.input}
            placeholder="Enter postcode for report"
            placeholderTextColor="#888"
            value={postcode}
            onChangeText={setPostcode}
          />
        )}
        <View style={styles.switchRow}>
          <Switch value={shareEmail} onValueChange={setShareEmail} />
          <Text style={styles.switchLabel}>Share Email</Text>
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send Message</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B141E" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#19232F",
  },
  navTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  dateLabel: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  messageItem: {
    marginBottom: 10,
  },
  user: {
    color: "#00FFFF",
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bubble: {
    backgroundColor: "#19232F",
    padding: 10,
    borderRadius: 14,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#0052cc",
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins",
  },
  timeText: {
    fontSize: 11,
    color: "#ccc",
    marginTop: 4,
    fontFamily: "Poppins",
  },
  trashIcon: {
    marginLeft: 8,
  },
  input: {
    backgroundColor: "#19232F",
    color: "#fff",
    fontSize: 14,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 10,
    borderColor: "#00FFFF",
    borderWidth: 1,
    fontFamily: "Poppins",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  switchLabel: {
    color: "#fff",
    marginLeft: 10,
    fontFamily: "Poppins",
  },
  sendButton: {
    margin: 10,
    padding: 14,
    backgroundColor: "#00FFFF",
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#000",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
});