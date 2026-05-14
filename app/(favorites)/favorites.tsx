import BusStopComponent from '@/components/bus-stop'
import { BusStop } from '@/types/busStop'
import { useUser } from '@clerk/clerk-expo'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'

const Favorites = () => {
  const { user } = useUser()
  const router = useRouter()
  const [favorites, setFavorites] = useState<BusStop[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | undefined>(undefined)

  const favoriteStopIds = useMemo(() => {
    const metadata = user?.unsafeMetadata as { favoriteStops?: string[] } | undefined
    if (!Array.isArray(metadata?.favoriteStops)) return []
    return metadata.favoriteStops.map(String)
  }, [user?.unsafeMetadata])

  const fetchStop = async (stopId: string) => {
    const baseURL = 'https://movoapi.gofkius.dev'
    const url = `${baseURL}/titsa/llegadas/${stopId}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      id: stopId,
      name: data?.parada?.descripcion ?? `Parada ${stopId}`,
      latitude: Number(data?.parada?.lat ?? 0),
      longitude: Number(data?.parada?.lng ?? 0),
      arrivals: Array.isArray(data?.llegadas) ? data.llegadas : [],
    } as BusStop
  }

  const loadFavorites = useCallback(async () => {
    if (!favoriteStopIds.length) {
      setFavorites([])
      return
    }

    setIsLoading(true)
    try {
      const results = await Promise.all(
        favoriteStopIds.map((stopId) =>
          fetchStop(stopId).catch((error) => {
            console.error('Error fetching favorite stop:', error)
            return null
          })
        )
      )
      setFavorites(results.filter(Boolean) as BusStop[])
    } finally {
      setIsLoading(false)
    }
  }, [favoriteStopIds])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  useEffect(() => {
    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      setUserLocation(currentLocation.coords)
    }

    loadLocation().catch((error) => {
      console.error('Error fetching location:', error)
    })
  }, [])

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25343F" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={async () => {
            setIsRefreshing(true)
            await loadFavorites()
            if (userLocation) {
              setIsRefreshing(false)
              return
            }
            try {
              const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              })
              setUserLocation(currentLocation.coords)
            } catch (error) {
              console.error('Error refreshing location:', error)
            }
            setIsRefreshing(false)
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {favoriteStopIds.length ? 'No hay datos disponibles.' : 'No tienes paradas favoritas aun.'}
            </Text>
          }
          renderItem={({ item }) => (
            <BusStopComponent
              item={item}
              userLocation={userLocation}
              onPress={() => router.push(`/stop/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  )
}

export default Favorites

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEFEF',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E2A33',
    textAlign: 'center',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 120,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#5A6B78',
    marginTop: 24,
  },
  // Card styling comes from BusStopComponent.
})