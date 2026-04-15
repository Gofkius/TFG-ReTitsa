import InitContextProvider from '@/context/initContext'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider tokenCache={tokenCache}>
        <InitContextProvider>
          <Stack>
            <Stack.Screen name="(home)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(firstload)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </InitContextProvider>
      </ClerkProvider>
    </ThemeProvider>
  )
}