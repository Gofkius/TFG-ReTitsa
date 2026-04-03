import { SignOutButton } from '@/components/sign-out-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useInitContext } from '@/context/initContext'
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Link, Redirect } from 'expo-router'
import { Button, StyleSheet } from 'react-native'

export default function Page() {
  const { user } = useUser()

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession()

  const context = useInitContext();

  if(!context.firstLoadReady){
    return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Loading...</ThemedText>
    </ThemedView>
    )
  }

  if(context.firstLoad === true){
    return <Redirect href={'/firstLoadStart'} />
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome!</ThemedText>
      {/* Show the sign-in and sign-up buttons when the user is signed out */}
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <ThemedText>Sign in</ThemedText>
        </Link>
        <Link href="/(auth)/sign-up">
          <ThemedText>Sign up</ThemedText>
        </Link>
      </SignedOut>
      {/* Show the sign-out button when the user is signed in */}
      <SignedIn>
        <ThemedText>Hello {user?.emailAddresses[0].emailAddress}</ThemedText>
          <Button title="Clear first load" onPress={() => context.setFirstLoad(true)} />
        <SignOutButton />
      </SignedIn>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 60,
    gap: 16,
    justifyContent: 'center',
  },
  buttonContinuar: {
    backgroundColor: '#FFC953',
    padding: 16,
    borderRadius: 27,
    alignItems: 'center',
    width: '100%',
    marginTop: 100,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  subtitle:{
    fontSize: 25,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  textButton: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  image: {
    position: 'absolute',
    bottom: 0,
  }
})