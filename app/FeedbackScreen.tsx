import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { auth, firestore } from '../firebaseconfig'
import { doc, getDoc } from 'firebase/firestore'

export default function FeedbackScreen() {
  const router = useRouter()
  const user = auth.currentUser

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      try {
        const docRef = doc(firestore, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setName(data.name || '')
          setEmail(data.email || '')
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    fetchUserData()
  }, [user])

  const sendEmail = async () => {
    const serviceID = 'service_scxm8hv'
    const templateID = 'template_bstnkb7'
    const userID = 's--PIzv3HKywJoyBD'
    const templateParams = { name, email, subject, message }

    setLoading(true)

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceID,
          template_id: templateID,
          user_id: userID,
          template_params: templateParams,
        }),
      })

      if (response.ok) {
        Alert.alert('Success', 'Your message has been sent successfully!')
        setSubject('')
        setMessage('')
        router.back()
      } else {
        Alert.alert('Error', 'Failed to send your message. Please try again later.')
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navIcon}>
          <Ionicons name="arrow-back-outline" size={26} color="#00FFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          Submit <Text style={styles.accent}>Feedback</Text>
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Main layout using FlatList to avoid ScrollView nesting */}
      <FlatList
        data={[]} // empty data since we only use ListHeaderComponent
        keyExtractor={(_, i) => i.toString()}
        renderItem={() => null}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
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

            <TouchableOpacity
              style={styles.button}
              onPress={sendEmail}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B141E",
  },
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
  container: {
    padding: 20,
    gap: 16,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 10,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  textArea: {
    height: 130,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#00FFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Poppins",
    fontWeight: "600",
  },
})