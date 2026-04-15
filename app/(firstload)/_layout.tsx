import { Stack } from 'expo-router'

export default function FirstLoadLayout() {
  return (
    <Stack>
      <Stack.Screen name="firstLoadStart" options={{ headerShown: false }} />
      <Stack.Screen name="firstLoadPreferences" options={{ headerShown: false }} />
    </Stack>
  )
}