import { Stack } from 'expo-router/stack';

export default function Layout() {

  return (
  <Stack>
    <Stack.Screen name="index" options={{ title: "Home", headerShown: false }} />
    <Stack.Screen name="firstLoadStart" options={{ title: "First Load", headerShown: false }} />
  </Stack>
  )
}