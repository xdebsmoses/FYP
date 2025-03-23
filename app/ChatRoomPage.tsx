import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Button, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { firestore, auth } from "../firebaseconfig";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: number;
  addedToReports: boolean;
}

const ChatRoomPage = () => {
  const route = useRoute();
  const { chatId, chatName } = route.params as { chatId: string; chatName: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [addToReports, setAddToReports] = useState(false);
  const [shareEmail, setShareEmail] = useState(true);
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
      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const chatMessages: Message[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Message),
          id: doc.id,
        }));
        setMessages(chatMessages);
      });
      return unsubscribe;
    };

    fetchUser();
    const unsubscribe = fetchMessages();
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!messageText) {
      alert("Message cannot be empty.");
      return;
    }
    try {
      await addDoc(collection(firestore, `group_chats/${chatId}/messages`), {
        text: messageText,
        user: shareEmail ? user : "Anonymous",
        timestamp: Date.now(),
        addedToReports: addToReports,
      });
      if (addToReports) {
        await addDoc(collection(firestore, "community_reports"), {
          message: messageText,
          user: shareEmail ? user : "Anonymous",
          timestamp: Date.now(),
        });
      }
      setMessageText("");
      setAddToReports(false);
      alert("Message sent.");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(firestore, `group_chats/${chatId}/messages/${messageId}`));
      alert("Message deleted.");
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{chatName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text>{item.text}</Text>
            <Text style={styles.user}>Sent by: {item.user}</Text>
            {item.user === user && (
              <TouchableOpacity onPress={() => deleteMessage(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Type your message"
        value={messageText}
        onChangeText={setMessageText}
      />
      <View style={styles.switchContainer}>
        <Switch value={addToReports} onValueChange={setAddToReports} />
        <Text>Add to Reports</Text>
      </View>
      <View style={styles.switchContainer}>
        <Switch value={shareEmail} onValueChange={setShareEmail} />
        <Text>{shareEmail ? "Share Email" : "Send Anonymously"}</Text>
      </View>
      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  messageItem: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  user: {
    fontSize: 12,
    color: "#555",
  },
  deleteButton: {
    color: "red",
    marginTop: 5,
    textAlign: "right",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
});

export default ChatRoomPage;