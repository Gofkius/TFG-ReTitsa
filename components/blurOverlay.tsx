import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export function BlurOverlay() {
  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, pointerEvents: 'none', zIndex: 0 }}>
      <MaskedView
        style={{ flex: 1 }}
        maskElement={
          <LinearGradient
            style={{ flex: 1 }}
            colors={['transparent', 'black']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        }
      >
        <BlurView intensity={100} style={{ flex: 1 }} />
      </MaskedView>
    </View>
  );
}