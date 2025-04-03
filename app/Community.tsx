import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from 'expo-router'
import { firestore } from "../firebaseconfig";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import axios from "axios";
import { format } from "date-fns";

interface PostcodeApiResponse {
  status: string;
  data?: { latitude: number; longitude: number };
}

type Report = {
  id: string;
  postcode: string;
  latitude: number;
  longitude: number;
  message: string;
  user: string;
  severity: string;
  timestamp: number;
};

const Community = ({ navigation }: any) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [postcode, setPostcode] = useState("");
  const [message, setMessage] = useState("");
  const [searchPostcode, setSearchPostcode] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // for date filtering
  const [user, setUser] = useState("Anonymous");
  const [severity, setRiskLevel] = useState("Low");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const q = query(collection(firestore, "community_reports"), orderBy("timestamp", "asc"));
      const snapshot = await getDocs(q);
      const formatted = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      setReports(formatted);
    } catch {
      Alert.alert("Error", "Failed to fetch community reports.");
    }
  };

  const convertPostcodeToCoordinates = async (postcode: string) => {
    try {
      const formatted = postcode.replace(/\s/g, "");
      const response = await axios.get(`https://api.getthedata.com/postcode/${formatted}`);
      if (response.data.status === "match" && response.data.data) {
        return {
          latitude: response.data.data.latitude,
          longitude: response.data.data.longitude,
        };
      }
      Alert.alert("Error", "Invalid postcode");
      return null;
    } catch {
      Alert.alert("Error", "Failed to fetch coordinates.");
      return null;
    }
  };

  const submitReport = async () => {
    if (!postcode || !message) {
      Alert.alert("Error", "Postcode and message required.");
      return;
    }

    const coords = await convertPostcodeToCoordinates(postcode);
    if (!coords) return;

    try {
      await addDoc(collection(firestore, "community_reports"), {
        postcode,
        message,
        user,
        severity,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: Date.now(),
      });
      Alert.alert("Success", "Report submitted.");
      setPostcode("");
      setMessage("");
      setRiskLevel("Low");
      fetchReports();
    } catch {
      Alert.alert("Error", "Could not submit report.");
    }
  };

  const filteredReports = reports.filter((r) =>
    r.postcode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navIcon}>
          <Ionicons name="arrow-back-outline" size={26} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          <Text>Community </Text>
          <Text style={styles.accent}>Reports</Text>
        </Text>
        <View style={{ width: 26 }} /> {/* Spacer */}
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter postcode (e.g., W1A 1AA)"
          placeholderTextColor="#888"
          value={postcode}
          onChangeText={setPostcode}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Describe the issue"
          placeholderTextColor="#888"
          multiline
          value={message}
          onChangeText={setMessage}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter risk level (Low, Medium, High)"
          placeholderTextColor="#888"
          value={severity}
          onChangeText={setRiskLevel}
        />
        <TouchableOpacity style={styles.button} onPress={submitReport}>
          <Text style={styles.buttonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Search by postcode"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />
      <TextInput
        style={[styles.input, { marginBottom: 10 }]}
        placeholder="Filter by date (yyyy-mm-dd)"
        placeholderTextColor="#888"
        value={dateFilter}
        onChangeText={setDateFilter}
      />

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.report}>
            <Text style={styles.reportPostcode}>{item.postcode}</Text>
            <Text style={styles.reportMessage}>{item.message}</Text>
            <Text style={styles.reportRisk}>Risk: {item.severity}</Text>
            <Text style={styles.reportUser}>Reported by: {item.user}</Text>
            <Text style={styles.reportUser}>Date: {format(new Date(item.timestamp), "MMMM d, yyyy")}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B141E" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
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
  card: {
    backgroundColor: "#19232F",
    padding: 16,
    margin: 14,
    borderRadius: 10,
  },
  input: {
    backgroundColor: "#0B141E",
    borderColor: "#00FFFF",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 10,
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#00FFFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Poppins",
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
  report: {
    backgroundColor: "#19232F",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 14,
    marginBottom: 10,
  },
  reportPostcode: {
    color: "#00FFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  reportMessage: {
    color: "#fff",
    fontSize: 14,
    marginTop: 6,
    fontFamily: "Poppins",
  },
  reportRisk: {
    color: "#ff4d4d",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    fontFamily: "Poppins",
  },
  reportUser: {
    color: "#888",
    fontSize: 12,
    marginTop: 6,
    fontFamily: "Poppins",
  },
});

export default Community;