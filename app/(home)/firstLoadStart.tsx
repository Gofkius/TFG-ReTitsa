import { ThemedView } from '@/components/themed-view';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { router } from 'expo-router';

import React from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';

const firstLoadStart = () => {

  function handleContinuar(){
    router.replace('/firstLoadPreferences');
  }

return (
    <ThemedView style={styles.container}>
    <Text style={styles.title}>Hola!👋</Text>
    <Text style={styles.subtitle}>¿Preparado a cambiar como sueles viajar?</Text>
    <Pressable style={styles.buttonContinuar} onPress={handleContinuar}>
        <Text style={styles.textButton}><FontAwesomeIcon size={25} icon={faArrowRight} /></Text>
    </Pressable>
    <Text 
        style={{alignSelf: 'center', opacity: 0.3, fontSize: 17}}>
        Continuar
    </Text>
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
    flex: 1,
    padding: 60,
    gap: 16,
    justifyContent: 'center',
  },
  buttonContinuar: {
    backgroundColor: '#FFC953',
    padding: 16,
    borderRadius: 27,
    alignItems: 'center',
    width: '100%',
    marginTop: 100,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  subtitle:{
    fontSize: 25,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  textButton: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  image: {
    position: 'absolute',
    bottom: 0,
  }
})