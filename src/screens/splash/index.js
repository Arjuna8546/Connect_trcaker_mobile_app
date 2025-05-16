import {
  SafeAreaView,
  Text,
  StyleSheet,
  ImageBackground
} from 'react-native';


export const SplashScreen = ({ navigation }) => {
  setTimeout(() => {
    navigation.replace('signin')
  }, 2000)
  return (
    <ImageBackground
      source={require('../../assets/splash.jpg')}
      resizeMode={'cover'}
      style={{ flex: 1, padding: 15 }}
    >
      <Text style={{
        fontSize: 18,
        color: "gray",
        fontWeight: 'bold',
      }}>SAMPLE APP</Text>
    </ImageBackground>
  );
}

const style = StyleSheet.create({})