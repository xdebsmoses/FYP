import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, Button, Alert, StyleSheet } from "react-native";
import { firestore } from "../firebaseconfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import axios from "axios";

interface PostcodeApiResponse {
  status: string;
  data?: {
    latitude: number;
    longitude: number;
  };
}

// Define the shape of a report
type Report = {
  id: string;
  postcode: string;
  latitude: number;
  longitude: number;
  message: string;
  user: string;
};

const Community = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [postcode, setPostcode] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState("Anonymous");

  // Fetch reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "community_reports"));
        const data: Report[] = querySnapshot.docs.map((doc) => {
          // Cast the data to the expected type (without the id)
          const reportData = doc.data() as Omit<Report, "id">;
          return {
            id: doc.id,
            postcode: reportData.postcode || "",
            latitude: reportData.latitude || 0,
            longitude: reportData.longitude || 0,
            message: reportData.message || "",
            user: reportData.user || "Anonymous",
          };
        });
        setReports(data);
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch reports.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("Error fetching community reports:", errorMessage);
        Alert.alert("Error", errorMessage);
      }
    };

    fetchReports();
  }, []);

  // Function to convert postcode to coordinates using GetTheData API
  const convertPostcodeToCoordinates = async (postcode: string) => {
    try {
      const formattedPostcode = postcode.replace(/\s/g, ""); // Remove spaces
      const apiUrl = `https://api.getthedata.com/postcode/${formattedPostcode}`;
      const response = await axios.get(apiUrl) as { data: PostcodeApiResponse };

      if (response.data.status === "match" && response.data.data) {
        const { latitude, longitude } = response.data.data;
        return { latitude, longitude };
      } else {
        Alert.alert("Error", "Invalid postcode. Please try again.");
        return null;
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to convert postcode to coordinates.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Error fetching coordinates:", errorMessage);
      Alert.alert("Error", errorMessage);
      return null;
    }
  };

  // Submit a new danger report
  const submitReport = async () => {
    if (!postcode || !message) {
      Alert.alert("Error", "Please enter a postcode and message.");
      return;
    }

    const coordinates = await convertPostcodeToCoordinates(postcode);
    if (!coordinates) return;

    try {
      await addDoc(collection(firestore, "community_reports"), {
        postcode,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        message,
        user,
        timestamp: Date.now(),
      });

      Alert.alert("Success", "Your report has been submitted!");
      setPostcode("");
      setMessage("");

      // Refresh reports
      const querySnapshot = await getDocs(collection(firestore, "community_reports"));
      const updatedReports: Report[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Report, "id">;
        return {
          id: doc.id,
          postcode: data.postcode || "",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          message: data.message || "",
          user: data.user || "Anonymous",
        };
      });
      setReports(updatedReports);
    } catch (error: unknown) {
      let errorMessage = "Could not submit your report.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Error submitting report:", errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Safety Reports</Text>

      {/* Form for submitting reports */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Postcode</Text>
        <TextInput
          style={styles.input}
          value={postcode}
          onChangeText={setPostcode}
          placeholder="Enter postcode (e.g., W1A 1AA)"
        />
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe the issue"
          multiline
        />
        <Button title="Submit Report" onPress={submitReport} />
      </View>

      {/* List of reports */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportItem}>
            <Text style={styles.postcode}>{item.postcode}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.user}>Reported by: {item.user}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: "#000",
    shadowOffset: { height: 2, width: 0 },
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  reportItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: "#000",
    shadowOffset: { height: 2, width: 0 },
  },
  postcode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    marginTop: 5,
  },
  user: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
});

export default Community;