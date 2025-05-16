import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import RoundButtonComp from '../../components/RoundButtonComp';
import InputFeildComponent from '../../components/InputFeildComponent';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    if (!email || !password) {
      Alert.alert("Validation Error", "Email and password are required.");
      return;
    }

    try {
      const response = await axios.post("http://192.168.44.253:8000/api/mobile/token/", {
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor={'#1a1a1a'} barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require('../../assets/signin.jpg')}
              style={styles.image}
            />
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>CONNECT</Text>
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 0.5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  formContainer: {
    flex: 0.5,
    paddingHorizontal: 30,
    paddingTop: 20,
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 25,
    opacity: 0.7,
  },
  inputsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  footerText: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 30,
    opacity: 0.6,
  },
});
