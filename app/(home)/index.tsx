import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useInitContext } from '@/context/initContext'
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Link, Redirect } from 'expo-router'
import { StyleSheet } from 'react-native'

import { AppleMaps, GoogleMaps, useLocationPermissions } from 'expo-maps'
import { useEffect } from 'react'
import { Platform, Text } from 'react-native'

export function Map() {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View
            style={{ flex: 1 }}
            properties={{ isMyLocationEnabled: true, 
                          pointsOfInterest: { including: [] }
                        }}
            uiSettings={{ myLocationButtonEnabled: true }}
            />
  } else if (Platform.OS === 'android') {
    return <GoogleMaps.View
            style={{ flex: 1 }}
            properties={{ isMyLocationEnabled: true,
                          mapStyleOptions: {
                          json: '[{"featureType":"poi","stylers":[{"visibility":"off"}]}]',
                        },
                        }}
            uiSettings={{ myLocationButtonEnabled: true }}
            />
  } else {
    return <Text>Maps are only available on Android and iOS</Text>
  }
}

export default function Page() {
  const { user } = useUser()

  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks
  const { session } = useSession()

  const context = useInitContext();

  const [status, requestPermission] = useLocationPermissions();

  useEffect(() => {
    if (!status?.granted) {
      requestPermission();
    }
  }, [status, requestPermission]);

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
        {/*
        <ThemedText>Hello {user?.emailAddresses[0].emailAddress}</ThemedText>
        <ThemedText>Session ID: {session?.id}</ThemedText>
        <ThemedText>First Load: {context.firstLoad ? 'true' : 'false'}</ThemedText>
        <ThemedText>Preferences: {context.preferences ? context.preferences : 'None'}</ThemedText>
        <Button title="Clear first load" onPress={() => {
          context.setFirstLoad(true) 
          context.setPreferences("")} } 
        />
        <SignOutButton />
        */}
        <Map />
      </SignedIn>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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