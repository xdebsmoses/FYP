import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Button, TouchableOpacity, StyleSheet } from "react-native";
import { firestore, auth } from "../firebaseconfig";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

interface Chat {
  id: string;
  name: string;
  createdBy: string;
  timestamp: number;
}

export type RootStackParamList = {
  GroupChatList: undefined;
  ChatRoomPage: { chatId: string; chatName: string };
  Reporting: undefined;
};

const GroupChatListPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [newChatName, setNewChatName] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchUser = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser.email || "Anonymous");
      }
    };

    fetchUser();
  }, []);

  // Fetch chats when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchChats = async () => {
        try {
          const querySnapshot = await getDocs(collection(firestore, "group_chats"));
          const chatData: Chat[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as Chat),
            id: doc.id,
          }));
          setChats(chatData);
        } catch (error) {
          console.error("Error fetching chats:", error);
        }
      };

      fetchChats();
    }, [])
  );

  const createNewChat = async () => {
    if (!newChatName) {
      alert("Enter a chat name.");
      return;
    }
    try {
      await addDoc(collection(firestore, "group_chats"), {
        name: newChatName,
        createdBy: user,
        timestamp: Date.now(),
      });
      setNewChatName("");
      alert("New chat created.");
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Group Chats</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new chat name"
        value={newChatName}
        onChangeText={setNewChatName}
      />
      <Button title="Create New Chat" onPress={createNewChat} />

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate("ChatRoomPage", { chatId: item.id, chatName: item.name })}
          >
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.createdBy}>Created by: {item.createdBy}</Text>
          </TouchableOpacity>
        )}
      />
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
    marginBottom: 10,
    borderRadius: 5,
  },
  chatItem: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  createdBy: {
    fontSize: 14,
    color: "#555",
  },
});

export default GroupChatListPage;