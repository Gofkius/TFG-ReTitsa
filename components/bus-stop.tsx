import { BusStop } from '@/types/busStop'
import { Image } from 'expo-image'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'


const BusStopComponent = ({ item }: { item: BusStop }) => {
    return (
        <View style={{ borderColor: '#BFC9D1', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20 }}>
            <View style={{ borderBottomColor: '#BFC9D1', borderBottomWidth: 1, paddingBottom: 10 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#25343F' }}> {item.name} </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <Image source={require('@/assets/images/walk-light.svg')} style={{ width: 20, height: 20, marginRight: 2 }} />
                    {/*Placeholder values*/}
                    <Text style={{ fontSize: 16, color: '#5A6B78' }}>1 min</Text>
                    <View style={{ width: 1, borderColor: '#5A6B78', borderLeftWidth: 1, height: 15, marginLeft: 7, marginRight: 7 }}></View>
                    {/*Placeholder values*/}
                    <Text style={{ fontSize: 16, color: '#5A6B78' }}>34m</Text>
                </View>
                <View style={{ width: 40, height: 40, position: 'absolute', right: 10, top: 7, borderRadius: 8, backgroundColor: '#FFC953', padding: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('@/assets/images/bus.svg')} style={{ width: 34, height: 34 }} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10, width: '100%', flexWrap: 'wrap' }}>
                {item.routes.map(route => (
                    <View key={route} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#BFC9D1', padding: 2, borderRadius: 7 }}>
                        <Image source={require('@/assets/images/bus-light.svg')} style={{ width: 20, height: 20 }} />
                        <Text style={{ fontSize: 16, color: '#5A6B78', marginRight: 2 }}>{route}</Text>
                    </View>
                ))}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 16, color: '#5A6B78' }}>Dirección {item.direction}</Text>
                </View>
            </View>
        </View>
    )
}

export default BusStopComponent

const styles = StyleSheet.create({})