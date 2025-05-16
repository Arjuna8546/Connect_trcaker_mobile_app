import { View, Text, ImageBackground, StatusBar, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React from 'react'
import RoundButtonComp from '../../components/RoundButtonComp'
import InputFeildComponent from '../../components/InputFeildComponent'

export default function SignIn({navigation}) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor={'#1a1a1a'} barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <ImageBackground source={require('../../assets/signin.jpg')} style={styles.image} />
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>CONNECT</Text>
            <Text style={styles.subtitle}>Welcome to our tracking app</Text>

            <View style={styles.inputsContainer}>
              <InputFeildComponent label={'Email'} keyboardType={'email-address'} />
              <InputFeildComponent label={'Password'} secureTextEntry={true} />
              <RoundButtonComp name={"Login"} border={true} onPress={()=>navigation.navigate('home')}/>
            </View>

            <Text style={styles.footerText}>
              Please login with your account in Connect
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
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
    backgroundColor: '#111',  // slightly lighter black for contrast
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
  }
})
