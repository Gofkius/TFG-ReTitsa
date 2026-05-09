import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useInitContext } from '@/context/initContext'
import { BusStop } from '@/types/busStop'
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import { Image } from 'expo-image'
import { Link, Redirect } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import { useEffect, useState } from 'react'
import { FlatList, Platform, Text } from 'react-native'
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps'

import BusStopComponent from '@/components/bus-stop'
import BusStopPoi from '@/components/bus-stop-poi'
import * as Location from 'expo-location'

  //------------------------------------------------//
  //            INTEGRATED MAP COMPONENT            //
  //------------------------------------------------//

export function Map({ userLocation, radius, busStops }: { userLocation?: Location.LocationObjectCoords | null, radius: number, busStops: BusStop[] }) {

  if (!userLocation) {
    return <Text>Loading map...</Text>
  }

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return <Text>Maps are only available on Android and iOS</Text>
  }

  const latitudeDelta = Math.max(0.002, (radius * 4) / 111320)
  const longitudeDelta = latitudeDelta / Math.max(Math.cos((userLocation.latitude * Math.PI) / 180), 0.2)
  const hidePoiMapStyle = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit.station', stylers: [{ visibility: 'off' }] },
  ]

  return (
    <MapView
      style={{ flex: 1 }}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      showsUserLocation
      showsMyLocationButton
      showsPointsOfInterest={false}
      customMapStyle={hidePoiMapStyle}
      region={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta,
        longitudeDelta,
      }}
    >
      {busStops.map((stop) => (
        <Marker
          key={stop.id}
          coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <BusStopPoi size={30} />
        </Marker>
      ))}
      <Circle
        center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
        radius={radius}
        strokeColor="#53B2FF"
        fillColor="rgba(83, 178, 255, 0.20)"
      />
    </MapView>
  )
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
  const [radius, setRadius] = useState(50) // Default radius in meters

  // Context for first load and preferences
  const context = useInitContext();

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Request location permissions on mount
  const [status, requestPermission] = Location.useForegroundPermissions();

  // State for network error
  const [networkError, setNetworkError] = useState(false)



  function handleRefresh() {
    try {
      setRefreshing(true)
      setNetworkError(false)
      // Re-fetch location and nearby buses
      if (location) {
        fetchNearbyBuses()
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
      setNetworkError(true)
    } finally {
      setRefreshing(false)
    }
  }

  //------------------------------------------------//
  //      LOCATION AND BUS STOP FETCHING LOGIC.     //
  //------------------------------------------------//

  const getInitialLocation = async () => {
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
    setLocation(currentLocation.coords)
  }

  const fetchNearbyBuses = async () => {
    const url = 'http://localhost:8080/titsa/cercanas' + `?lat=${location?.latitude}&lng=${location?.longitude}&radio=${radius}`

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
        // New API response ---  stop is nested under `parada`, and arrivals are in `llegadas`
        const parada = item.parada
        const llegadas = item.llegadas

        const routesFromArrivals = Array.isArray(llegadas) ? llegadas.map((a: any) => String(a.linea)) : []

        // Direction from descripcion_larga; routes come from arrivals only
        const direction = llegadas.destino
        const routes = routesFromArrivals

        return {
          id: String(parada.id),
          name: parada.descripcion,
          latitude: parada.lat,
          longitude: parada.lng,
          direction: direction,
          routes: routes,
          arrivals: Array.isArray(llegadas) ? llegadas.map((a: any) => ({ linea: String(a.linea), destino: a.destino, minutos: Number(a.minutos) })) : [],
        }
      })

      console.log('Transformed buses:', transformedData)
      setNearbyBuses(transformedData)
    } catch (error) {

      console.error('Error fetching nearby buses:', error)
      setNetworkError(true)
    }
  }

  useEffect(() => {
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
    if(location) {
      fetchNearbyBuses()
    }
  }, [location, radius])
  
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


  function handleRadiusChange() {
    // Cycle through predefined radius values: 50m, 100m, 200m, 500m
    const radiusOptions = [50, 100, 200, 500]
    const currentIndex = radiusOptions.indexOf(radius)
    const nextIndex = (currentIndex + 1) % radiusOptions.length
    setRadius(radiusOptions[nextIndex])
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
          {position: 'absolute', zIndex: 2, backgroundColor: '#EAEFEF',
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
                <Pressable onPress={handleRadiusChange} style={{backgroundColor: '#BFC9D1', borderRadius: 20, height: 25, width: 65, marginLeft: 10, justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{fontSize: 16, color: '#25343F'}}>{radius}m</Text>
                </Pressable>
              </View>
            </View>



            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
              {networkError ? (
                <View style={{justifyContent: 'center', alignItems: 'center', width: 250, marginBottom: 50}}>

                  <Image source={require('@/assets/images/sad.svg')} style={{width: 42, height: 42}} />
                  <Text style={{fontSize: 16, color: '#25343F', textAlign: 'center'}}>
                    No se han podido cargar los datos. Revisa tu conexión e inténtalo de nuevo.
                  </Text>

                </View>
              ) : !nearbyBuses ? (
                <Text style={{fontSize: 16, color: '#25343F'}}>Loading...</Text>
              ) : nearbyBuses.length === 0 ? (
                <View style={{justifyContent: 'center', alignItems: 'center', width: 250, marginBottom: 50}}>

                  <Image source={require('@/assets/images/sad.svg')} style={{width: 42, height: 42}} />
                  <Text style={{fontSize: 16, color: '#25343F', textAlign: 'center'}}>
                    ¡Uh oh! No encontramos paradas cerca de ti
                  </Text>
                </View>
              ) : (
              <FlatList
                style={{width: '100%', padding: 20, marginBottom: 0}}
                contentContainerStyle={{paddingBottom: 80}}
                data={nearbyBuses}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  console.log('Rendering BusStop - location:', location)
                  return <BusStopComponent item={item} userLocation={location} />
                }}
              />)}

            </View>
        </View>
        <Map userLocation={location} radius={radius} busStops={nearbyBuses ?? []} />
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