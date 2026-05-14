import BusStopPoi from '@/components/bus-stop-poi'
import React from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

type AlertItem = {
  id: string
  line: string
  subtitle: string
  message: string
  stops: string[]
}

const mockAlerts: AlertItem[] = [
  {
    id: 'line-014',
    line: 'Linea 014',
    subtitle: 'Aviso de Titsa',
    message: 'Las siguientes paradas se encontraran deshabilitadas desde 14/04 hasta 18/04',
    stops: ['La Higuerita', 'La Higuerita (T)'],
  },
  {
    id: 'line-027',
    line: 'Linea 027',
    subtitle: 'Comunicado de Titsa',
    message: 'Aviso importante: mantenimiento programado. No habra servicio en las siguientes paradas:',
    stops: ['El Cardonal', 'El Cardonal (T)'],
  },
  {
    id: 'line-041',
    line: 'Linea 041',
    subtitle: 'Informacion oficial de Titsa',
    message: 'Por obras en la via, cierre temporal de paradas. Afectado:',
    stops: ['Los Guanches', 'Los Guanches (T)'],
  },
]

const Alerts = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockAlerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={styles.lineTitle}>{item.line}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.iconBadge}>
                <BusStopPoi size={40} />
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.message}>{item.message}</Text>
            <View style={styles.stopList}>
              {item.stops.map((stop) => (
                <View key={stop} style={styles.stopRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.stopText}>{stop}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default Alerts

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAEFEF',
    flex: 1,
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
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5DB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  lineTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22313B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#5B6C78',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFC94D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E2A33',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5DB',
    marginVertical: 10,
  },
  message: {
    fontSize: 16,
    color: '#5B6C78',
    marginBottom: 10,
  },
  stopList: {
    gap: 8,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5B6C78',
    marginRight: 10,
  },
  stopText: {
    fontSize: 16,
    color: '#5B6C78',
  },
})