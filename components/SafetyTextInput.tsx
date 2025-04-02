// components/SafetyTextInput.tsx
import React from 'react'
import { TextInput, StyleSheet, TextInputProps } from 'react-native'

export const SafetyTextInput: React.FC<TextInputProps> = (props) => {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#CCCCCC"
    />
  )
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
})