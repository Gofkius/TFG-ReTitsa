import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return (
    <Stack>
      <Stack.Screen name="sign-up" options={{ headerShown: false, title: 'Registro' }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false, title: 'Iniciar Sesión' }} />
    </Stack>
  )
}