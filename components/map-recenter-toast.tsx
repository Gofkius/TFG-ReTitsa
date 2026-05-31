import { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native'

type MapRecenterToastProps = {
  onPress: () => void
  label?: string
}

export default function MapRecenterToast({ onPress, label = 'Recentrar' }: MapRecenterToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(10)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, translateYAnim])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <Pressable onPress={onPress} style={styles.pressable}>
        <Text style={styles.text}>{label}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 370,
  },
  pressable: {
    minWidth: 120,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAEFEF',
    borderColor: '#BFC9D1',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  text: {
    color: '#25343F',
    fontSize: 14,
    fontWeight: '600',
  },
})
