import { ThemedView } from '@/components/themed-view';
import { useInitContext } from '@/context/initContext';
import { router } from 'expo-router';

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const firstLoadStart = () => {

  const context = useInitContext();
  
  function handleTranvia(){
    context.setFirstLoad(false);
    context.setPreferences('tram');
    router.replace('/sign-up');
  }
  
  function handleGuagua(){
    context.setFirstLoad(false);
    context.setPreferences('bus');
    router.replace('/sign-up');
  }

  function handleAmbos(){
    context.setFirstLoad(false);
    context.setPreferences('both');
    router.replace('/sign-up');
  }

return (
    <ThemedView style={styles.container}>
        <Text style={styles.title}>¿Con cual sueles viajar? 🚃</Text>
        <View style={{gap: 0, padding: 0}}>
            <Pressable style={styles.buttonTransporte} onPress={handleTranvia}>
                <Image source={require('@/assets/images/tram-config.png')} style={{position: 'absolute', width: 230, height: 96, left: 120}} />
                <Text style={[styles.textButton]}>Tranvía</Text>
            </Pressable>
            <Pressable style={styles.buttonTransporte} onPress={handleGuagua}>
                <Image source={require('@/assets/images/bus-config.png')} style={{position: 'absolute', width: 180, height: 96, left: -28}} />
                <Text style={[styles.textButton, {marginLeft: 150}]}>Guagua</Text>
            </Pressable>
        </View>
        <Pressable style={styles.buttonAmbos} onPress={handleAmbos}>
            <Text style={[styles.textButton, {color: '#EAEFEF'}]}>Ambos</Text>
        </Pressable>
        <Image 
            source={require('@/assets/images/firstLoad.png')} 
            style={styles.image}
        />
    </ThemedView>
)
}

export default firstLoadStart

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAEFEF',
    flex: 1,
    padding: 60,
    gap: 10,
    justifyContent: 'center',
  },
  buttonTransporte: {
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#FFC953',
    padding: 16,
    borderRadius: 27,
    alignItems: 'center',
    width: '100%',
    height: 125,
    marginTop: 20,
  },
  buttonAmbos: {
    backgroundColor: '#25343F',
    padding: 16,
    borderRadius: 27,
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    textAlign: 'center'
  },
  subtitle:{
    fontSize: 25,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  textButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  image: {
    position: 'absolute',
    bottom: 0,
  }
})