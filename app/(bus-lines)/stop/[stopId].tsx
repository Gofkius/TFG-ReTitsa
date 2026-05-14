import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

type Arrival = {
  linea: string
  descripcionLinea: string
  destino: string
  minutos: number
}

type StopDetails = {
  parada: {
    lat: number
    lng: number
    id: string
    descripcion: string
    descripcion_larga: string
  }
  llegadas: Arrival[]
}

const BusStopDetails = () => {
  const { stopId } = useLocalSearchParams<{ stopId?: string }>()
  const [details, setDetails] = useState<StopDetails | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formatArrivalMinutes = (minutes: number) => {
    if (minutes === 0) return 'Ahora'
    return `${minutes} min`
  }

  const fetchStopDetails = useCallback(async () => {
    if (!stopId) return

    const baseURL = 'https://movoapi.gofkius.dev'
    const url = `${baseURL}/titsa/llegadas/${stopId}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        console.error('Fetch error:', response.status, response.statusText)
        return
      }

      const data = await response.json()
      setDetails(data)
    } catch (error) {
      console.error('Error fetching stop details:', error)
    }
  }, [stopId])

  useEffect(() => {
    fetchStopDetails()
  }, [fetchStopDetails])

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#EAEFEF' }}>
      <Stack.Screen options={{ title: `Parada ${stopId ?? ''}`.trim() }} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#25343F', textAlign: 'center', marginBottom: 10 }}>
        {details?.parada?.descripcion ?? 'Desconocido'}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: '600', color: '#25343F', marginBottom: 20 , alignSelf: 'center'}}>
        Llegadas / Salidas
      </Text>
      <FlatList
        data={details?.llegadas ?? []}
        keyExtractor={(item, index) => `${item.linea}-${item.destino}-${index}`}
        contentContainerStyle={{ paddingBottom: 70 }}
        refreshing={isRefreshing}
        onRefresh={async () => {
          setIsRefreshing(true)
          await fetchStopDetails()
          setIsRefreshing(false)
        }}
        renderItem={({ item }) => (
          <View style={styles.arrivalCard}>
            <View style={styles.arrivalHeader}>
              <Text style={styles.lineBadge}>Linea {item.linea}</Text>
              <Text style={styles.arrivalTime}>{formatArrivalMinutes(item.minutos)}</Text>
            </View>
            <Text style={styles.arrivalDestination}>DESTINO {item.destino}</Text>
            <View style={{ width: '100%', height: 1, backgroundColor: '#BFC9D1', marginVertical: 8 }} />
            <Text style={styles.arrivalDescription}>{item.descripcionLinea.trim()}</Text>
          </View>
        )}
      />
    </View>
  )
}

export default BusStopDetails

const styles = StyleSheet.create({
  arrivalCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFC9D1',
  },
  arrivalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  lineBadge: {
    fontSize: 24,
    fontWeight: '700',
    color: '#25343F',
  },
  arrivalTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#25343F',
  },
  arrivalDestination: {
    width: '85%',
    fontSize: 16,
    fontWeight: '600',
    color: '#5A6B78',
    marginBottom: 4,
  },
  arrivalDescription: {
    fontSize: 12,
    color: '#5A6B78',
  },
})
