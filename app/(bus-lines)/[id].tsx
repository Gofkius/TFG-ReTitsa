import { useUser } from '@clerk/clerk-expo'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

const BusStop = ({ data, isFavorite, onToggleFavorite }: {
  data: { codigo?: number; nombre?: string; tipo?: string }
  isFavorite: boolean
  onToggleFavorite: (stopId?: number) => void
}) => {
  const router = useRouter()

  return (
    <View style={styles.stopCard}>
      <Pressable
        onPress={() => router.push(`/stop/${data.codigo}`)}
        style={styles.stopInfo}
      >
        <Text style={styles.stopTitle}>Parada {data.nombre ?? 'unknown'}</Text>
        <Text style={styles.stopCode}>Codigo {data.codigo ?? 'unknown'}</Text>
      </Pressable>
      <Pressable
        onPress={() => onToggleFavorite(data.codigo)}
        style={styles.starButton}
        hitSlop={8}
      >
        <MaterialIcons
          name={isFavorite ? 'star' : 'star-border'}
          size={28}
          color={isFavorite ? '#FFC94D' : '#5A6B78'}
        />
      </Pressable>
    </View>
  )
}

const BusLineDetails = () => {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const [busLineDetails, setBusLineDetails] = useState<{ paradas: Array<{ codigo: number; nombre: string; tipo: string }> }>({ paradas: [] })
  const [direction, setDirection] = useState<string>('11') // Default to 'ida'
  const { user } = useUser()
  const [favoriteStops, setFavoriteStops] = useState<string[]>([])
  const hasLoadedFavoritesRef = useRef(false)

  useEffect(() => {
    if (!user || hasLoadedFavoritesRef.current) return
    const metadata = user?.unsafeMetadata as { favoriteStops?: string[] } | undefined
    if (Array.isArray(metadata?.favoriteStops)) {
      setFavoriteStops(metadata.favoriteStops.map(String))
      hasLoadedFavoritesRef.current = true
      return
    }
    hasLoadedFavoritesRef.current = true
  }, [user?.unsafeMetadata])

  const favoriteSet = useMemo(() => new Set(favoriteStops), [favoriteStops])

  const toggleFavoriteStop = async (stopId?: number) => {
    if (!stopId || !user) return
    const key = String(stopId)

    let next: string[] = []
    setFavoriteStops((prev) => {
      const isFavorite = prev.includes(key)
      next = isFavorite ? prev.filter((item) => item !== key) : [...prev, key]
      return next
    })

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          favoriteStops: next,
        },
      })
    } catch (error) {
      console.error('Error saving favorite stop:', error)
      setFavoriteStops((prev) => (prev.includes(key) ? prev : [...prev, key]))
    }
  }

  const fetchBusLineDetails = async (lineId: string) => {
    const baseURL = 'https://movoapi.gofkius.dev'
    const url = `${baseURL}/titsa/itinerario?linea=${lineId}&trayecto=${direction}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      })

      if (!response.ok) {
        console.error('Fetch error:', response.status, response.statusText)
        return
      }

      const data = await response.json()
      setBusLineDetails(data)
    } catch (error) {
      console.error('Error fetching bus line details:', error)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchBusLineDetails(String(id))
  }, [id, direction])

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#EAEFEF' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#25343F', textAlign: 'center'}}>Línea {id ?? 'unknown'}</Text>
        <Text style={{ fontSize: 18, color: '#5A6B78', textAlign: 'center', marginBottom: 20 }}>Sentido actual: {direction === '11' ? 'Ida' : 'Vuelta'}</Text>
        <Pressable onPress={() => {
            const newDirection = direction === '11' ? '12' : '11'
            setDirection(newDirection)
          }}>
            <View style={{ backgroundColor: '#25343F', borderColor: '#BFC9D1', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 20, color: '#F5F7FA', maxWidth: '80%', alignSelf: 'center' }}>Cambiar sentido</Text>
            </View>
        </Pressable>
          <FlatList
            data={busLineDetails?.paradas ?? []}
            keyExtractor={(item) => String(item.codigo)}
            contentContainerStyle={{ paddingBottom: 60 }}
            extraData={favoriteStops}
            renderItem={({ item }) => (
              <BusStop
                data={item}
                isFavorite={favoriteSet.has(String(item.codigo))}
                onToggleFavorite={toggleFavoriteStop}
              />
            )}
          />
    </View>
  )
}

export default BusLineDetails

const styles = StyleSheet.create({
  stopCard: {
    borderColor: '#BFC9D1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopInfo: {
    flex: 1,
    paddingRight: 8,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#25343F',
  },
  stopCode: {
    fontSize: 16,
    color: '#5A6B78',
  },
  starButton: {
    padding: 10,
  },
})