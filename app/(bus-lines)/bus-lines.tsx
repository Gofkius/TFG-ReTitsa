import BusStopPoi from '@/components/bus-stop-poi'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'

const BusLine = (data: { id: string; name: string; direction: string }) => {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`/${data.id}`)}
      style={{ borderColor: '#BFC9D1', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20 }}
    >
            <View style={{paddingBottom: 10 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#25343F', maxWidth: '80%' }}>{data.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <Text style={{ fontSize: 16, color: '#5A6B78', width: '80%' }}>
                      {data.direction}
                    </Text>
                </View>
                <View style={{ position: 'absolute', right: 10, top: 2 }}>
                  <BusStopPoi size={40} />
                </View>
            </View>
    </Pressable>
  )
}

const BusLines = () => {

  const baseURL = 'https://movoapi.gofkius.dev'
  const url = `${baseURL}/titsa/lineas`

  const [busLines, setBusLines] = useState<any[]>([])

  async function fetchBusLines() {
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      })

      if (!response.ok) {
        console.error('Fetch error:', response.status, response.statusText)
        return
      }

      try {
        const data = await response.json()
        setBusLines(data)
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }

  }

  useEffect(() => {
    fetchBusLines()
  }, [])

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#EAEFEF' }}>
      <FlatList
        data={busLines}
        renderItem={({ item }) => (
          <BusLine id={String(item.id)} name={String(item.id)} direction={String(item.nombre)} />
        )}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  )
}

export default BusLines

const styles = StyleSheet.create({})