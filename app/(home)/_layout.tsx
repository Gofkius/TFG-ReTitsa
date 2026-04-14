import { Stack } from 'expo-router/stack';

export default function Layout() {

  return (
  <Stack>
    <Stack.Screen name="index" options={{ title: "Menu Principal", headerShown: false }} />
    <Stack.Screen name="firstLoadStart" options={{ title: "Bienvenidos!", headerShown: false }} />
    <Stack.Screen name="firstLoadPreferences" options={{ title: "Preferencias", headerShown: false }} />
  </Stack>
  )
}