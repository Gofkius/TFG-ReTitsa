import InitContextProvider from '@/context/initContext'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Image } from 'expo-image'
import { Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider tokenCache={tokenCache}>
        <InitContextProvider>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: '#1C1E21',
              tabBarShowLabel: false,
              tabBarItemStyle: {
                justifyContent: 'center',
                alignItems: 'center',
              },
              tabBarLabelStyle: {
                display: 'none',
              },
              tabBarStyle: {
                flex: 1,
                marginHorizontal: 20,
                backgroundColor: '#FFC953',
                borderRadius: 27.5,
                height: 60,
                width: '90%',
                position: 'absolute',
                bottom: 20,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              },
            }}
          >
            <Tabs.Screen 
              name="(home)" 
              options={{ 
                headerShown: false,
                title: "Home",
                tabBarLabel: 'Home',
                tabBarIcon: ({ focused, size }) => (
                  <View style={{
                    backgroundColor: focused ? '#EBEFF3' : 'transparent', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 25, 
                    borderRadius: 30,
                    marginTop: 20
                    }}>
                    <Image source={require('@/assets/images/home-navbar.svg')} style={{ width: size, height: size }} />
                  </View>
                ),
              }} 
            />
            <Tabs.Screen 
              name="(alerts)" 
              options={{ 
                headerShown: false,
                title: "Alerts",
                tabBarLabel: 'Alerts',
                tabBarIcon: ({ focused, size }) => (
                  <View style={{
                    backgroundColor: focused ? '#EBEFF3' : 'transparent', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 25, 
                    borderRadius: 30,
                    marginTop: 20
                    }}>
                    <Image source={require('@/assets/images/bell-navbar.svg')} style={{ width: size, height: size }} />
                  </View>
                ),
              }} 
            />
            <Tabs.Screen 
              name="(favorites)" 
              options={{ 
                headerShown: false,
                title: "Favorites",
                tabBarLabel: 'Favorites',
                tabBarIcon: ({ focused, size }) => (
                  <View style={{
                    backgroundColor: focused ? '#EBEFF3' : 'transparent', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 25, 
                    borderRadius: 30,
                    marginTop: 20
                    }}>
                    <Image source={require('@/assets/images/star-navbar.svg')} style={{ width: size, height: size }} />
                  </View>
                ),
              }} 
            />
            <Tabs.Screen 
              name="(auth)" 
              options={{ 
                headerShown: false,
                href: null  // Hide from navbar
              }} 
            />
            <Tabs.Screen 
              name="(firstload)" 
              options={{ 
                headerShown: false,
                href: null  // Hide from navbar
              }} 
            />
          </Tabs>
          <StatusBar style="auto" />
        </InitContextProvider>
      </ClerkProvider>
    </ThemeProvider>
  )
}