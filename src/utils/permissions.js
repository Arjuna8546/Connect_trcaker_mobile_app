import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

// Request location permissions for Android
const requestLocationPermissions = async () => {
  if (Platform.OS === 'android') {
    // Request ACCESS_FINE_LOCATION
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'We need your location to track your ride.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
      // Request ACCESS_BACKGROUND_LOCATION
      const backgroundPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'We need background location to track your ride when the app is not active.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return backgroundPermission === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  }
  return true;
};

// Request notification permissions
async function requestNotificationPermission() {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

// Combine permissions
const requestAllPermissions = async () => {
  try {
    const locationGranted = await requestLocationPermissions();
    const notificationsGranted = await requestNotificationPermission();
    return locationGranted && notificationsGranted;
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

// Main permission function
export const checkAndRequestPermissions = async () => {
  try {
    const hasPermissions = await requestAllPermissions();
    if (hasPermissions) {
      console.log('All permissions granted!');
      return true;
    } else {
      console.log('Permissions not granted.');
      return false;
    }
  } catch (err) {
    console.error('Error checking permissions:', err);
    return false;
  }
};