import { Stack } from 'expo-router'

export default function AlertsLayout() {
  return (
    <Stack>
      <Stack.Screen name="alerts" options={{ headerShown: false }} />
    </Stack>
  )
}