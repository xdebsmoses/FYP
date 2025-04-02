// app/FeedbackScreen.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'

export default function FeedbackScreen() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const sendEmail = async () => {
    // Replace these values with your EmailJS details
    const serviceID = "service_scxm8hv"
    const templateID = "template_bstnkb7"
    const userID = "s--PIzv3HKywJoyBD"

    const templateParams = {
      name,
      email,
      subject,
      message,
    }

    setLoading(true)
    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceID,
          template_id: templateID,
          user_id: userID,
          template_params: templateParams,
        }),
      })
      if (response.ok) {
        Alert.alert("Success", "Your message has been sent successfully!")
        setName("")
        setEmail("")
        setSubject("")
        setMessage("")
        router.back()
      } else {
        Alert.alert("Error", "Failed to send your message. Please try again later.")
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>
          Submit <Text style={styles.highlight}>Feedback</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Subject"
          placeholderTextColor="#888"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Your Message"
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={sendEmail} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Sending..." : "Send Message"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B141E",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Poppins",
    marginBottom: 20,
  },
  highlight: {
    color: "#00FFFF",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  button: {
    backgroundColor: "#00FFFF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Poppins",
    fontWeight: "600",
  },
})