import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth } from "../firebaseconfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
  const [search, setSearch] = useState("");
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

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navIcon}>
          <Ionicons name="arrow-back-outline" size={26} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Safety <Text style={styles.accent}>Group Chats</Text></Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Create new group chat */}
      <TextInput
        style={styles.input}
        placeholder="Enter new chat name..."
        placeholderTextColor="#888"
        value={newChatName}
        onChangeText={setNewChatName}
      />
      <TouchableOpacity style={styles.createButton} onPress={createNewChat}>
        <Text style={styles.createButtonText}>+ Create Chat</Text>
      </TouchableOpacity>

      {/* Search Chat */}
      <TextInput
        style={styles.input}
        placeholder="Search by postcode or name..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {/* List of group chats */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
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
    </SafeAreaView>
  );
};

export default GroupChatListPage;

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
    paddingVertical: 14,
    backgroundColor: "#19232F",
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
  input: {
    backgroundColor: "#19232F",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#00FFFF",
    marginHorizontal: 20,
    marginTop: 12,
  },
  createButton: {
    backgroundColor: "#00FFFF",
    marginTop: 10,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins",
  },
  chatList: {
    padding: 20,
  },
  chatItem: {
    backgroundColor: "#19232F",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Poppins",
  },
  createdBy: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Poppins",
  },
});
