import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { signUpWithEmail, sendVerificationEmail, updateUserProfile } from '../authService';

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
      const user = await signUpWithEmail(email, password); // Sign up the user
      await updateUserProfile(name); // Update the user's name in Firebase
      await sendVerificationEmail(user); // Send verification email
      Alert.alert(
        'Success',
        'Account created successfully. Please verify your email before logging in.'
      );
      router.push('/Login'); // Navigate to login
    } catch (error: any) {
      Alert.alert('Sign-Up Error', error.message); // Show error message
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />

      {/* Go to Login Section */}
      <View style={styles.loginSection}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/Login')}>
          <Text style={styles.loginLink}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  loginSection: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#555',
  },
  loginLink: {
    fontSize: 16,
    color: 'blue',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
});