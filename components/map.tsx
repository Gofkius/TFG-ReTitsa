import { BusStop } from "@/types/busStop"
import * as Location from "expo-location"
import { useEffect, useRef, useState } from "react"
import { Platform, Text, View } from "react-native"
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps"
import BusStopPoi from "./bus-stop-poi"
import MapRecenterToast from "./map-recenter-toast"
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated'


export default function Map({ userLocation, radius, busStops, busLineColors, animatedIndex, onBusStopPress }: { userLocation?: Location.LocationObjectCoords | null, radius: number, busStops: BusStop[], busLineColors: string[], animatedIndex: SharedValue<number>, onBusStopPress?: (stop: BusStop) => void }) {
  const mapRef = useRef<MapView | null>(null)
  const hasCenteredInitially = useRef(false)
  const [isCenteredOnUser, setIsCenteredOnUser] = useState(true)

  const animatedToastStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.2], [1, 0], Extrapolation.CLAMP)
    return {
      opacity,
    }
  })

  useEffect(() => {
    if (!hasCenteredInitially.current && userLocation) {
      const latitudeDelta = Math.max(0.0012, (radius * 2.2) / 111320)
      const longitudeDelta = latitudeDelta / Math.max(Math.cos((userLocation.latitude * Math.PI) / 180), 0.2)

      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude - latitudeDelta * 0.33,
          longitude: userLocation.longitude,
          latitudeDelta,
          longitudeDelta,
        },
        350
      )
      hasCenteredInitially.current = true
    }
  }, [radius])

  // Zoom out map when radius changes to display new circle
  useEffect(() => {
    if (userLocation) {
      const latitudeDelta = Math.max(0.0012, (radius * 2.2) / 111320)
      const longitudeDelta = latitudeDelta / Math.max(Math.cos((userLocation.latitude * Math.PI) / 180), 0.2)
      
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude - latitudeDelta * 0.33,
          longitude: userLocation.longitude,
          latitudeDelta,
          longitudeDelta,
        },
        350
      )
      setIsCenteredOnUser(true)
    }
  }, [radius])

  useEffect(() => {
    if (Platform.OS !== 'ios' || !userLocation) {
      return
    }

    const latitudeDelta = Math.max(0.0012, (radius * 2.2) / 111320)
    const longitudeDelta = latitudeDelta / Math.max(Math.cos((userLocation.latitude * Math.PI) / 180), 0.2)
    const nudge = latitudeDelta * 0.0001

    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude - latitudeDelta * 0.33 + nudge,
        longitude: userLocation.longitude,
        latitudeDelta,
        longitudeDelta,
      },
      1
    )
  }, [busStops.length, radius])
  
  // Early returns after all hooks
  if (!userLocation) {
    return <Text>Loading map...</Text>
  }

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return <Text>Maps are only available on Android and iOS</Text>
  }

  const latitudeDelta = Math.max(0.0012, (radius * 2.2) / 111320)
  const longitudeDelta = latitudeDelta / Math.max(Math.cos((userLocation.latitude * Math.PI) / 180), 0.2)

  const validBusStops = busStops.filter(
    (stop) =>
      Number.isFinite(stop.latitude) &&
      Number.isFinite(stop.longitude)
  )

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

  const centerOffsetMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const centerMapOnUser = () => {
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude - latitudeDelta * 0.33,
        longitude: userLocation.longitude,
        latitudeDelta,
        longitudeDelta,
      },
      350
    )
    setIsCenteredOnUser(true)
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        key={Platform.OS === 'ios' ? `ios-pois-${validBusStops.length}` : undefined}
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}
        showsPointsOfInterest={false}
        customMapStyle={hidePoiMapStyle}
        initialRegion={{
          latitude: userLocation.latitude - latitudeDelta * 0.33,
          longitude: userLocation.longitude,
          latitudeDelta,
          longitudeDelta,
        }}
        onRegionChangeComplete={(region) => {
          const offsetLatitude = userLocation.latitude - latitudeDelta * 0.33
          const distanceFromCenteredView = centerOffsetMeters(
            region.latitude,
            region.longitude,
            offsetLatitude,
            userLocation.longitude
          )

          // Consider map centered if camera is close to the intended offset position
          setIsCenteredOnUser(distanceFromCenteredView < 20)
        }}
      >
        {busStops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={Platform.OS === 'android'}
            onPress={() => onBusStopPress?.(stop)}
          >
            <BusStopPoi color={busLineColors[index]} size={30} />
          </Marker>
        ))}
        <Circle
          center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
          radius={radius}
          strokeColor="#53B2FF"
          fillColor="rgba(83, 178, 255, 0.20)"
        />
      </MapView>

      {!isCenteredOnUser ? (
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, animatedToastStyle]} pointerEvents="box-none">
          <MapRecenterToast onPress={centerMapOnUser} label="Recentrar" />
        </Animated.View>
      ) : null}
    </View>
  )
}