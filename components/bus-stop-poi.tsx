import { Image } from 'expo-image'
import { View } from 'react-native'

type BusStopPoiProps = {
  size?: number
}

export default function BusStopPoi({ size = 40 }: BusStopPoiProps) {
  const iconSize = Math.round(size * 0.85)

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.2),
        backgroundColor: '#FFC953',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
       source={require('@/assets/images/bus.svg')}
       style={{ width: iconSize, height: iconSize }} 
       />
    </View>
  )
}
