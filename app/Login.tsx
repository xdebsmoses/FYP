// app/Login.tsx
import React, { useState } from 'react'
import { View, Text, Image, Alert, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { login, resetPassword } from '../authService'
import { SafetyButton } from '../components/SafetyButton'
import { SafetyTextInput } from '../components/SafetyTextInput'
import { LinkButton } from '../components/LinkButton'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.')
      return
    }
    try {
      const message = await resetPassword(email)
      Alert.alert('Success', message)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const handleLogin = async () => {
    try {
      await login(email, password)
      router.push('/Home')
    } catch (error: any) {
      Alert.alert('Login Error', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WELCOME</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <SafetyTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <SafetyTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <SafetyButton onPress={handleLogin}>Login</SafetyButton>

      <LinkButton onPress={handleForgotPassword}>Forgot Password?</LinkButton>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don’t have an account?</Text>
        <LinkButton onPress={() => router.push('/SignUp')} style={styles.signupLink}>
          Sign Up
        </LinkButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins',
  },
  signupLink: {
    marginLeft: 5,
  },
})