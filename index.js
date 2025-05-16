import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { startForegroundService } from './src/utils/location';


// notifee.registerForegroundService(notification => {
//   return new Promise(async () => {
//     // await startForegroundService().catch(err => console.error(err));
//   });
// });

AppRegistry.registerComponent(appName, () => App);
