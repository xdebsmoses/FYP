// components/LinkButton.tsx
import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native'

interface LinkButtonProps extends TouchableOpacityProps {
  onPress: () => void
  children: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  onPress,
  children,
  style,
  textStyle,
  ...props
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.linkContainer, style]} {...props}>
      <Text style={[styles.linkText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  linkContainer: {
    // Optionally add padding or margin if needed
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
})