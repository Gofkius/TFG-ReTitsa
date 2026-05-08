import { BusStop } from '@/types/busStop'
import { Image } from 'expo-image'
import * as Location from 'expo-location'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface BusStopComponentProps {
  item: BusStop
  userLocation?: Location.LocationObjectCoords
}

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate walking time in minutes based on distance (standard walking speed ~5 km/h)
const calculateWalkingTime = (distanceInMeters: number): number => {
  const walkingSpeedMPerMin = 83.33 // 5 km/h = 83.33 m/min
  return Math.max(1, Math.round(distanceInMeters / walkingSpeedMPerMin))
}

const formatLineNumber = (line: string): string => {
  return /^\d{2}$/.test(line) ? `0${line}` : line
}

const BusStopComponent = ({ item, userLocation }: BusStopComponentProps) => {
  const routeList = useMemo(() => {
    const fromArrivals = item.arrivals?.map((a) => a.linea) ?? []
    const fromRoutes = item.routes ?? []
    return Array.from(new Set([...fromArrivals, ...fromRoutes].filter(Boolean)))
  }, [item.arrivals, item.routes])

  const { distance, walkingTime } = useMemo(() => {
    if (!userLocation) return { distance: null, walkingTime: null }
    const meters = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      item.latitude,
      item.longitude
    )
    const roundedMeters = Math.round(meters)
    return {
      distance: roundedMeters,
      walkingTime: calculateWalkingTime(roundedMeters),
    }
  }, [userLocation, item.latitude, item.longitude])
    return (
        <View style={{ borderColor: '#BFC9D1', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20 }}>
            <View style={{ borderBottomColor: '#BFC9D1', borderBottomWidth: 1, paddingBottom: 10 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#25343F', maxWidth: '80%' }}>{item.name} </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <Image source={require('@/assets/images/walk-light.svg')} style={{ width: 20, height: 20, marginRight: 2 }} />
                    <Text style={{ fontSize: 16, color: '#5A6B78' }}>{walkingTime !== null && walkingTime !== undefined ? `${walkingTime} min` : 'Calculating...'}</Text>
                    <View style={{ width: 1, borderColor: '#5A6B78', borderLeftWidth: 1, height: 15, marginLeft: 7, marginRight: 7 }}></View>
                    <Text style={{ fontSize: 16, color: '#5A6B78' }}>{distance !== null && distance !== undefined ? `${distance}m` : 'Calculating...'}</Text>
                </View>
                <View style={{ width: 40, height: 40, position: 'absolute', right: 10, top: 2, borderRadius: 8, backgroundColor: '#FFC953', padding: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('@/assets/images/bus.svg')} style={{ width: 34, height: 34 }} />
                </View>
            </View>
            {item.arrivals && item.arrivals.length > 0 ? (
              <View style={{ marginTop: 10, gap: 8 }}>
                {item.arrivals.map((arrival, index) => (
                  <View key={`${arrival.linea}-${arrival.destino}-${index}`} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' }}>
                    <View style={{ width: 64, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: '#BFC9D1', paddingHorizontal: 6, borderRadius: 7 }}>
                      <Image source={require('@/assets/images/bus-light.svg')} style={{ width: 20, height: 20 }} />
                      <Text style={{ fontSize: 16, color: '#5A6B78', marginRight: 2 }}>{formatLineNumber(arrival.linea)}</Text>
                    </View>
                    <Text style={{ fontSize: 16, color: '#5A6B78', flexShrink: 1 }}>{`${arrival.minutos} min. - ${arrival.destino}`}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10, width: '100%', flexWrap: 'wrap' }}>
                {routeList.map((route) => (
                  <View key={route} style={{ width: 60, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#BFC9D1', borderRadius: 7 }}>
                    <Image source={require('@/assets/images/bus-light.svg')} style={{ width: 20, height: 20 }} />
                    <Text style={{ fontSize: 16, color: '#5A6B78', marginRight: 2 }}>{formatLineNumber(route)}</Text>
                  </View>
                ))}
                {item.direction ? (
                  <Text style={{ fontSize: 16, color: '#5A6B78', flexShrink: 1 }}>{`Dirección ${item.direction}`}</Text>
                ) : null}
              </View>
            )}
        </View>
    )
}

export default BusStopComponent

const styles = StyleSheet.create({})