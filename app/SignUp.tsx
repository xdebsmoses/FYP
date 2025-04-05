import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebaseconfig";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signUpWithEmail, sendVerificationEmail, updateUserProfile } from '../authService';
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    try {
      const user = await signUpWithEmail(email, password, name, phone);
      await updateUserProfile(name);
      await sendVerificationEmail(user);

      // Create user doc with onboardingCompleted flag
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        email,
        phone,
        onboardingCompleted: false,
      });

      Alert.alert('Success', 'Account created successfully. Please verify your email before logging in.');
      router.push('/Login');
    } catch (error: any) {
      Alert.alert('Sign-Up Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create <Text style={styles.accent}>Account</Text></Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginSection}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/Login')}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B141E',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  accent: {
    color: '#00FFFF',
  },
  input: {
    backgroundColor: '#19232F',
    color: '#fff',
    fontFamily: 'Poppins',
    borderRadius: 10,
    borderColor: '#00FFFF',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#00FFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  loginLink: {
    color: '#00FFFF',
    fontSize: 14,
    fontFamily: 'Poppins',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
});