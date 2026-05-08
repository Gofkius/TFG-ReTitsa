import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useInitContext } from '@/context/initContext'
import { BusStop } from '@/types/busStop'
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Image } from 'expo-image'
import { Link, Redirect } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppleMaps, GoogleMaps, useLocationPermissions } from 'expo-maps'
import { useEffect, useState } from 'react'
import { FlatList, Platform, Text } from 'react-native'

import BusStopComponent from '@/components/bus-stop'
import * as Location from 'expo-location'

  //------------------------------------------------//
  //            INTEGRATED MAP COMPONENT            //
  //------------------------------------------------//

export function Map() {

  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null)

  useEffect(() => {
    const getInitialLocation = async () => {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      setLocation(location.coords)
    }
    getInitialLocation()
  }, [])

  if (!location) {
    return <Text>Loading map...</Text>
  }

  if (Platform.OS === 'ios') {
    return <AppleMaps.View
            style={{ flex: 1 }}
            properties={{ isMyLocationEnabled: true, 
                          pointsOfInterest: { including: [] },
                        }}
            uiSettings={{ myLocationButtonEnabled: true }}
            cameraPosition={{ zoom: 17, coordinates: { latitude: location.latitude - 0.0005, longitude: location.longitude } }}
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
  // If your user isn't appearing as signed in,
  // it's possible they have session tasks to complete.
  // Learn more: https://clerk.com/docs/guides/configure/session-tasks

  //------------------------------------------------//
  //               BUS AND USER STATES              //
  //------------------------------------------------//

  const { user } = useUser()
  const { session } = useSession()

  // State for nearby bus stops and user location
  const [nearbyBuses, setNearbyBuses] = useState<BusStop[]>()
  const [location, setLocation] = useState<Location.LocationObjectCoords | undefined>(undefined)

  // Context for first load and preferences
  const context = useInitContext();

  // Request location permissions on mount
  const [status, requestPermission] = useLocationPermissions();



  //------------------------------------------------//
  //      LOCATION AND BUS STOP FETCHING LOGIC.     //
  //------------------------------------------------//

  useEffect(() => {
    const getInitialLocation = async () => {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      setLocation(currentLocation.coords)
    }

    getInitialLocation()
  }, [])


  // Re-request permissions if status changes to not granted

  useEffect(() => {
    if (!status?.granted) {
      requestPermission();
    }
  }, [status, requestPermission]);


  // Fetch nearby bus stops whenever location changes

  useEffect(() => {
    const fetchNearbyBuses = async () => {

      const url = 'http://localhost:8080/titsa/cercanas' + `?lat=${location?.latitude}&lng=${location?.longitude}&radio=50`

      try {
        const response = await fetch(
          url,
          {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
          }
        )
        
        if (!response.ok) {
          console.error('Fetch error:', response.status, response.statusText)
          return
        }
        
        const data = await response.json()

        const transformedData = data.map((item: any) => {
          // Support responses where stop is nested under `parada`, and arrivals are in `llegadas`
          const parada = item.parada ?? item
          const llegadas = item.llegadas ?? parada.llegadas ?? []

          const routesFromArrivals = Array.isArray(llegadas) ? llegadas.map((a: any) => String(a.linea)) : []

          // Try to extract route from descripcion_larga if arrivals are missing
          const descripcionLarga = parada.descripcion_larga || parada.direction || ''
          const routeMatch = (!routesFromArrivals.length && descripcionLarga) ? descripcionLarga.match(/Línea (\d+)/) : null
          const routes = routesFromArrivals.length ? routesFromArrivals : (routeMatch ? [routeMatch[1]] : [])

          return {
            id: String(parada.id ?? item.id),
            name: parada.descripcion ?? parada.name ?? item.descripcion ?? item.name ?? '',
            latitude: parada.lat ?? parada.latitude ?? item.lat ?? item.latitude,
            longitude: parada.lng ?? parada.longitude ?? item.lng ?? item.longitude,
            direction: descripcionLarga,
            routes: routes,
            arrivals: Array.isArray(llegadas) ? llegadas.map((a: any) => ({ linea: String(a.linea), destino: a.destino, minutos: Number(a.minutos) })) : [],
          }
        })

        console.log('Transformed buses:', transformedData)
        setNearbyBuses(transformedData)
      } catch (error) {
        console.error('Error fetching nearby buses:', error)
      }
    }
    
    if(location) {
      fetchNearbyBuses()
    }
  }, [location])
  
  // Load and first load logic

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

  //------------------------------------------------//
  //                  UI COMPONENTS                 //
  //------------------------------------------------//

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
        <View style={
          {position: 'absolute', zIndex: 1, backgroundColor: '#EAEFEF',
          borderRadius: 20, borderColor: '#BFC9D1', borderWidth: 1, width: '100%', height: 350, bottom: 0}
          }>
            <View style={{flexDirection: 'row', alignItems: 'center', borderColor: '#BFC9D1', borderBottomWidth: 1,
              height: 50, width: '100%'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}>
                <Image source={require('@/assets/images/bus.svg')} style={{width: 24, height: 24}} />
                <Text style={{fontSize: 16, marginLeft: 10, color: '#25343F'}}>Guagua</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', marginRight: 20}}>
                <Text style={{fontSize: 16, color: '#25343F'}}>Rango</Text>
                <Pressable style={{backgroundColor: '#BFC9D1', borderRadius: 20, height: 25, width: 65, marginLeft: 10, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: 16, color: '#25343F'}}>50m</Text>
                </Pressable>
              </View>
            </View>

            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
              {!nearbyBuses ? (
                <Text style={{fontSize: 16, color: '#25343F'}}>Loading...</Text>
              ) : nearbyBuses.length === 0 ? (
                <View style={{justifyContent: 'center', alignItems: 'center', width: 250, marginBottom: 50}}>
                  <Image source={require('@/assets/images/sad.svg')} style={{width: 42, height: 42}} />
                  <Text style={{fontSize: 16, color: '#25343F', textAlign: 'center'}}>¡Uh oh! No encontramos paradas cerca de ti</Text>
                </View>
              ) : (
              <FlatList
                style={{width: '100%', padding: 20, marginBottom: 0}}
                contentContainerStyle={{paddingBottom: 80}}
                data={nearbyBuses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  console.log('Rendering BusStop - location:', location)
                  return <BusStopComponent item={item} userLocation={location} />
                }}
              />)}

            </View>
        </View>
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