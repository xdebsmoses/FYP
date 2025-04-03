import { Stack } from "expo-router"

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 👈 hides top header for all screens
        animation: "fade",
      }}
    />
  )
}