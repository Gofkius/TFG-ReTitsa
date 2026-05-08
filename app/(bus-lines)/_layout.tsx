import { Stack } from 'expo-router'

export default function BusLinesLayout() {
  return (
    <Stack>
      <Stack.Screen name="bus-lines" options={{ headerShown: true, title: 'Lineas' }} />
    </Stack>
  )
}