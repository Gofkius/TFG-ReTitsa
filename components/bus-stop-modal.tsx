import { BusStop } from '@/types/busStop'
import { Image } from 'expo-image'
import * as Location from 'expo-location'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface BusStopModalProps {
  visible: boolean
  busStop: BusStop | null
  userLocation?: Location.LocationObjectCoords
  onClose: () => void
  onDismiss?: () => void
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

// Calculate walking time in minutes based on distance (standard walking speed ~4.5 km/h)
const calculateWalkingTime = (distanceInMeters: number): number => {
  const walkingSpeedMPerMin = 75 // 4.5 km/h = 75 m/min
  return Math.max(1, Math.round(distanceInMeters / walkingSpeedMPerMin))
}

const formatLineNumber = (line: string): string => {
  return /^\d{2}$/.test(line) ? `0${line}` : line
}

const BusStopModal = ({ visible, busStop, userLocation, onClose, onDismiss }: BusStopModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 20, useNativeDriver: true }),
      ]).start()
    }
  }, [visible])

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      onClose()
      onDismiss?.()
    })
  }, [onClose, onDismiss])

  const routeList = useMemo(() => {
    if (!busStop) return []
    const fromArrivals = busStop.arrivals?.map((a) => a.linea) ?? []
    const fromRoutes = busStop.routes ?? []
    return Array.from(new Set([...fromArrivals, ...fromRoutes].filter(Boolean)))
  }, [busStop?.arrivals, busStop?.routes])

  const { distance, walkingTime } = useMemo(() => {
    if (!userLocation || !busStop) return { distance: null, walkingTime: null }
    const meters = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      busStop.latitude,
      busStop.longitude
    )
    const roundedMeters = Math.round(meters)
    return {
      distance: roundedMeters,
      walkingTime: calculateWalkingTime(roundedMeters),
    }
  }, [userLocation, busStop?.latitude, busStop?.longitude])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
          onPress={handleClose}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <Pressable
              style={styles.modal}
              onPress={() => {}} // Prevent closing when pressing inside modal
            >
          {busStop && (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Stop name */}
              <Text style={styles.stopName}>{busStop.name}</Text>

              {/* Arrivals section */}
              {busStop.arrivals && busStop.arrivals.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Próximos autobuses</Text>
                  <View style={styles.arrivals}>
                    {busStop.arrivals.map((arrival, index) => (
                      <View
                        key={`${arrival.linea}-${arrival.destino}-${index}`}
                        style={styles.arrivalCard}
                      >
                        <View style={styles.lineBadge}>
                          <Image
                            source={require('@/assets/images/bus-light.svg')}
                            style={styles.busIcon}
                          />
                          <Text style={styles.lineText}>
                            {formatLineNumber(arrival.linea)}
                          </Text>
                        </View>
                        <View style={styles.arrivalInfo}>
                          <Text style={styles.arrivalTime}>
                            {arrival.minutos === 0
                              ? 'Ahora'
                              : `${arrival.minutos} min.`}
                          </Text>
                          <Text style={styles.arrivalDestination}>
                            {arrival.destino}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.section}>
                  <View style={styles.routeRow}>
                    {routeList.map((route) => (
                      <View key={route} style={styles.lineBadge}>
                        <Image
                          source={require('@/assets/images/bus-light.svg')}
                          style={styles.busIcon}
                        />
                        <Text style={styles.lineText}>
                          {formatLineNumber(route)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {busStop.direction ? (
                    <Text style={styles.directionText}>
                      Dirección {busStop.direction}
                    </Text>
                  ) : null}
                </View>
              )}
            </ScrollView>
          )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  )
}

export default BusStopModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modal: {
    backgroundColor: '#EAEFEF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFC9D1',
    width: '100%',
    maxHeight: '70%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* Header card */
  card: {
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#EAEFEF',
    borderWidth: 1,
    borderColor: '#BFC9D1',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  stopName: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#25343F',
    marginBottom: 6,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  walkIcon: {
    width: 18,
    height: 18,
  },
  distanceText: {
    fontSize: 14,
    color: '#5A6B78',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#5A6B78',
    marginHorizontal: 6,
  },

  /* Sections */
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#25343F',
    marginBottom: 10,
  },

  /* Arrival cards */
  arrivals: {
    gap: 10,
  },
  arrivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EAEFEF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFC9D1',
    padding: 12,
  },
  lineBadge: {
    minWidth: 60,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#BFC9D1',
    borderRadius: 7,
    paddingHorizontal: 8,
  },
  busIcon: {
    width: 18,
    height: 18,
  },
  lineText: {
    fontSize: 15,
    color: '#5A6B78',
    fontWeight: '500',
  },
  arrivalInfo: {
    flex: 1,
  },
  arrivalDestination: {
    fontSize: 13,
    color: '#5A6B78',
  },
  arrivalTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25343F',
    marginBottom: 2,
  },

  /* Routes fallback */
  routeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  directionText: {
    fontSize: 14,
    color: '#5A6B78',
    marginTop: 10,
  },

  /* Coordinates */
  coordCard: {
    backgroundColor: '#EAEFEF',
    borderWidth: 1,
    borderColor: '#BFC9D1',
    borderRadius: 8,
    padding: 12,
  },
  coordText: {
    fontSize: 13,
    color: '#5A6B78',
    fontFamily: 'monospace',
  },
})
