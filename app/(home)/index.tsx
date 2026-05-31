import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useInitContext } from '@/context/initContext'
import { BusStop } from '@/types/busStop'
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo'
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet'
import { Image } from 'expo-image'
import { Redirect } from 'expo-router'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

import BusStopComponent from '@/components/bus-stop'
import BusStopModal from '@/components/bus-stop-modal'
import Map from '@/components/map'
import * as Location from 'expo-location'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Text } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'


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
  const [radius, setRadius] = useState(100) // Default radius in meters
  const cacheRef = useRef<Record<string, BusStop[]>>({})
  const inFlightRef = useRef<AbortController | null>(null)
  const lastFetchAtRef = useRef(0)
  const lastFetchRadiusRef = useRef(radius)
  const lastFetchLocationRef = useRef<Location.LocationObjectCoords | null>(null)
  const [currentBottomSheetSnapPoint, setCurrentBottomSheetSnapPoint] = useState<string>('50%')
  const animatedIndex = useSharedValue(0)

  // State for modal
  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // Context for first load and preferences
  const context = useInitContext();

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Request location permissions on mount
  const [status, requestPermission] = Location.useForegroundPermissions();

  // State for network error
  const [networkError, setNetworkError] = useState(false)

  // Helper to convert HSL to RGB format (guarantees perfect cross-platform support in React Native)
  const hslToRgb = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return `rgb(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))})`;
  }

  const busLineColors = useMemo(() => {
    if (!nearbyBuses) return []
    const totalStops = nearbyBuses.length
    const startColor = '#FFC953'
    const startHue = 10
    
    return nearbyBuses.map((_, index) => {
      if (index === 0) {
        return startColor
      }
      const hue = totalStops > 1 ? (startHue + (index * (360 / totalStops))) % 360 : startHue
      return hslToRgb(hue, 85, 70)
    })
  }, [nearbyBuses])



  async function handleRefresh() {
    try {
      setRefreshing(true)
      setNetworkError(false)

      // Force one fresh location read for pull-to-refresh.
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      setLocation(currentLocation.coords)
      fetchNearbyBuses(currentLocation.coords)
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

  const fetchNearbyBuses = async (
    coords: Location.LocationObjectCoords | undefined = location,
    options: { prefetch?: boolean; radiusOverride?: number } = {}
  ) => {
    if (!coords) return

    const baseUrl = 'https://movoapi.gofkius.dev'
    const radiusValue = options.radiusOverride ?? radius
    const cacheKey = `${radiusValue}:${coords.latitude.toFixed(4)}:${coords.longitude.toFixed(4)}`
    const cached = cacheRef.current[cacheKey]

    if (cached && !options.prefetch) {
      setNearbyBuses(cached)
    }

    if (!options.prefetch) {
      inFlightRef.current?.abort()
      inFlightRef.current = new AbortController()
    }

    const url = baseUrl + `/titsa/cercanas?lat=${coords.latitude}&lng=${coords.longitude}&radio=${radiusValue}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        signal: options.prefetch ? undefined : inFlightRef.current?.signal,
      })
      
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

      cacheRef.current[cacheKey] = transformedData

      if (!options.prefetch) {
        setNearbyBuses(transformedData)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Error fetching nearby buses:', error)
      setNetworkError(true)
    }
  }

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null
    let isMounted = true

    const startLocationTracking = async () => {
      let granted = status?.granted ?? false

      if (!granted) {
        const permissionResult = await requestPermission()
        granted = permissionResult.granted
      }

      if (!granted) {
        return
      }

      const lastKnownLocation = await Location.getLastKnownPositionAsync({
        maxAge: 30000,
        requiredAccuracy: 100,
      })

      if (isMounted && lastKnownLocation?.coords) {
        setLocation(lastKnownLocation.coords)
      }

      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      if (!isMounted) return
      setLocation(initialLocation.coords)

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (updatedLocation) => {
          if (isMounted) {
            setLocation(updatedLocation.coords)
          }
        }
      )
    }

    startLocationTracking()

    return () => {
      isMounted = false
      subscription?.remove()
    }
  }, [status?.granted, requestPermission])


  // Fetch nearby bus stops whenever radius changes or we get a new location, but only if we have a location to fetch for

  useEffect(() => {
    if (location) {
      const now = Date.now()
      const radiusChanged = radius !== lastFetchRadiusRef.current
      
      // Fórmula Haversine rápida para calcular metros entre dos puntos GPS
      const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Radio de la tierra en metros
        const dLat = ((lat2 - lat1) * Math.PI) / 180
        const dLon = ((lon2 - lon1) * Math.PI) / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2)
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
      }

      let distanceMoved = 0
      if (lastFetchLocationRef.current) {
        distanceMoved = calcDistance(
          location.latitude, location.longitude,
          lastFetchLocationRef.current.latitude, lastFetchLocationRef.current.longitude
        )
      }

      const isFirstFetch = !lastFetchLocationRef.current // ¿Es la primera vez que abre la app?
      const hasMovedSignificantly = distanceMoved > 50 // ¿Caminó/condujo más de 50 metros?
      const isStandingStillButNeedsUpdate = (now - lastFetchAtRef.current >= 45000) // 45 segs para actualizar tiempos de llegada

      const shouldFetch = isFirstFetch || radiusChanged || hasMovedSignificantly || isStandingStillButNeedsUpdate

      if (!shouldFetch) {
        return // El GPS se movió un par de metros solo, ignoramos el re-render.
      }

      lastFetchAtRef.current = now
      lastFetchRadiusRef.current = radius
      lastFetchLocationRef.current = location // Guardamos dónde estábamos en esta petición

      fetchNearbyBuses(location)

      const radiusOptions = [100, 200, 500]
      const currentIndex = radiusOptions.indexOf(radius)
      const nextRadius = radiusOptions[(currentIndex + 1) % radiusOptions.length]
      const previousRadius = radiusOptions[(currentIndex - 1 + radiusOptions.length) % radiusOptions.length]

      void fetchNearbyBuses(location, { prefetch: true, radiusOverride: nextRadius })
      void fetchNearbyBuses(location, { prefetch: true, radiusOverride: previousRadius })
    }
  }, [location, radius])
  
  // Load and first load logic

  const snapPoints = useMemo(() => ['50%','100%'], []);

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
    // Cycle through predefined radius values: 100m, 200m, 500m
    const radiusOptions = [100, 200, 500]
    const currentIndex = radiusOptions.indexOf(radius)
    const nextIndex = (currentIndex + 1) % radiusOptions.length
    setRadius(radiusOptions[nextIndex])
  }

  const handleBusStopPress = (busStop: BusStop) => {
    setSelectedBusStop(busStop)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  const handleModalDismiss = () => {
    setSelectedBusStop(null)
  }
  
  //------------------------------------------------//
  //                  UI COMPONENTS                 //
  //------------------------------------------------//

  return (
    <ThemedView style={styles.container}>

        <View
          style={{            
            flexDirection: 'row', 
            width: '90%',
            height: 45,
            position: 'absolute', 
            top: 80, 
            zIndex: 2,
            borderRadius: 20, 
            alignSelf: 'center',
          }}
        >
          <View style={{
            flex: 1,
            }}>
            <TextInput placeholder="Nombre de parada" style={{
              flex: 1,
              width: '95%',
              padding: 10,
              borderRadius: 20,
              backgroundColor: '#EAEFEF', 
              borderColor: '#BFC9D1',
              borderWidth: 1,
            }} />
          </View>
          <SignedOut>
            <Pressable style={{
              backgroundColor: '#EAEFEF',
              borderColor: '#BFC9D1',
              borderWidth: 1,
              borderRadius: 50,
              height: 45,
              width: 45,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{color: '#25343F'}}>Out</Text>
            </Pressable>
          </SignedOut>
          <SignedIn>
              <Pressable style={{
              backgroundColor: '#EAEFEF',
              borderColor: '#BFC9D1',
              borderWidth: 1,
              borderRadius: 50,
              height: 45,
              width: 45,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{color: '#25343F'}}>In</Text>
            </Pressable>
          </SignedIn>
        </View>

        <Map userLocation={location} radius={radius} busStops={nearbyBuses ?? []} busLineColors={busLineColors} onBusStopPress={handleBusStopPress} animatedIndex={animatedIndex} />
        <BottomSheet
          index={1} 
          snapPoints={snapPoints}
          animatedIndex={animatedIndex}
          onAnimate={(fromIndex, toIndex) => {
            setCurrentBottomSheetSnapPoint(toIndex === 0 ? '50%' : '100%')
          }}
          onChange={(index) => {
            setCurrentBottomSheetSnapPoint(index === 0 ? '50%' : '100%')
          }}
          enableOverDrag={false}
          enableDynamicSizing={false}
          topInset={140}
          style={{zIndex: 10, elevation: 10}}
          backgroundStyle={
          {
            backgroundColor: '#EAEFEF',
            borderRadius: 20,
            borderColor: '#BFC9D1',
            borderWidth: 1,
          }
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
              {networkError ? (
                <BottomSheetView style={{justifyContent: 'center', alignItems: 'center', width: 250, marginBottom: 50}}>

                  <Image source={require('@/assets/images/sad.svg')} style={{width: 42, height: 42}} />
                  <Text style={{fontSize: 16, color: '#25343F', textAlign: 'center'}}>
                    No se han podido cargar los datos. Revisa tu conexión e inténtalo de nuevo.
                  </Text>

                </BottomSheetView>
              ) : !nearbyBuses ? (
                <Text style={{fontSize: 16, color: '#25343F'}}>Loading...</Text>
              ) : nearbyBuses.length === 0 ? (
                <BottomSheetView style={{justifyContent: 'center', alignItems: 'center', width: 250, marginBottom: 50}}>

                  <Image source={require('@/assets/images/sad.svg')} style={{width: 42, height: 42}} />
                  <Text style={{fontSize: 16, color: '#25343F', textAlign: 'center'}}>
                    ¡Uh oh! No encontramos paradas cerca de ti
                  </Text>
                </BottomSheetView>
              ) : (
              <BottomSheetFlatList
                style={{width: '100%', padding: 20, marginBottom: 0}}
                contentContainerStyle={{paddingBottom: 80}}
                data={nearbyBuses}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                  return <BusStopComponent item={item} userLocation={location} onPress={() => handleBusStopPress(item)} color={busLineColors[index]} />
                }}
              />)}
        </BottomSheet>

        <BusStopModal
          visible={modalVisible}
          busStop={selectedBusStop}
          userLocation={location}
          onClose={handleCloseModal}
          onDismiss={handleModalDismiss}
        />
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
  },
})