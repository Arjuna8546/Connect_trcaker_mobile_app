
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "./src/screens/splash";
import SignIn from "./src/screens/signin";
import HomeScreen from "./src/screens/home";

const stack = createNativeStackNavigator()



export default function App() {
  return (
    <NavigationContainer>
      <stack.Navigator>
        <stack.Screen name={'splash'} component={SplashScreen} options={{headerShown:false}}/>
        <stack.Screen name={'signin'} component={SignIn} options={{headerShown:false}}/>
        <stack.Screen name={'home'} component={HomeScreen} options={{headerShown:false}}/>
      </stack.Navigator>
    </NavigationContainer>
  )
}