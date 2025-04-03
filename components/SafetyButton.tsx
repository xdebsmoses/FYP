// components/SafetyButton.tsx
import React, { useRef } from 'react'
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native'

interface SafetyButtonProps {
  onPress: (event: GestureResponderEvent) => void
  children: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export const SafetyButton: React.FC<SafetyButtonProps> = ({
  onPress,
  children,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.button, style, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={[styles.buttonText, textStyle]}>{children}</Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'aqua',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: '#000', // black text
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins', // ensure Poppins is loaded
  },
})