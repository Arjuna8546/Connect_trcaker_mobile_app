import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Image
} from 'react-native';
import RoundButtonComp from '../../components/RoundButtonComp';
import InputFeildComponent from '../../components/InputFeildComponent';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HTTP_BACKEND_URL } from '@env';
import Video from 'react-native-video';

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Email and password are required.");
      return;
    }

    try {
      const response = await axios.post(`${HTTP_BACKEND_URL}/api/mobile/token/`, {
        email,
        password,
      });

      const { access, refresh, userDetails } = response.data;

      await AsyncStorage.setItem("access_token", access);
      await AsyncStorage.setItem("refresh_token", refresh);
      await AsyncStorage.setItem("user", JSON.stringify(userDetails));

      navigation.navigate('home');
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <Video
        source={require('../../assets/background.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        repeat
        muted
        rate={1.0}
        ignoreSilentSwitch="obey"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.overlay}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>CONNECT</Text>
            </View>
            <Text style={styles.subtitle}>Welcome to our tracking app</Text>

            <View style={styles.inputsContainer}>
              <InputFeildComponent
                label={'Email'}
                keyboardType={'email-address'}
                value={email}
                onChangeText={setEmail}
              />
              <InputFeildComponent
                label={'Password'}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
              <RoundButtonComp
                name={"Login"}
                border={true}
                onPress={handleLogin}
              />
            </View>

            <Text style={styles.footerText}>
              Please login with your account in Connect
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 80,
    paddingBottom: 40,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 30,
    opacity: 0.8,
    textAlign: 'center',
  },
  inputsContainer: {
    width: '100%',
    gap: 20,
  },
  footerText: {
    color: 'gray',
    fontSize: 12,
    marginTop: 30,
    opacity: 0.7,
    textAlign: 'center',
  },
  logoContainer: {
  flexDirection: 'row',
  alignItems: 'flex-end', // Align bottom
  marginBottom: 20,       // More spacing from below elements
},

logo: {
  width: 40,
  height: 40,
  marginRight: 10,
},

title: {
  color: 'white',
  fontSize: 34,
  fontWeight: 'bold',
  paddingBottom: 4, // Slight nudge down to align better
}


});
