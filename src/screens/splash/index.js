import React, { useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  View,
} from 'react-native';

export const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('signin');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../../assets/backgroundsplash.jpg')}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Conect</Text>
          <Text style={styles.motto}>
            <Text style={styles.mottoText}>Book. </Text>
            <Text style={styles.mottoHighlight}>Beyond </Text>
            <Text style={styles.mottoText}>Rides. </Text>
            <Text style={styles.mottoHighlight}>Connect.</Text>
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  motto: {
    fontSize: 16,
    textAlign: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mottoText: {
    color: '#e0e0e0',
  },
  mottoHighlight: {
    color: '#3399ff',
    fontWeight: '600',
  },
});
