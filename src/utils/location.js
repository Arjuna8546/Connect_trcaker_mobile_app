import Geolocation from 'react-native-geolocation-service';

// Watch user’s location
export const watchMerchantPosition = (successFn, errorFn) => {
  console.log('watchMerchantPosition called');
  const watchID = Geolocation.watchPosition(successFn, errorFn, {
    accuracy: { android: 'high' },
    enableHighAccuracy: true,
    distanceFilter: 0, 
    interval: 30000, 
    fastestInterval: 1000, 
    showLocationDialog: true, 
    forceRequestLocation: true, 
  });
  console.log('watchID created:', watchID);
  return watchID;
};

// Handle successful location updates
export function watchMerchantPositionSuccess(position) {
  console.log('New location:', position.coords, 'Timestamp:', new Date().toISOString());
  return position;
}

// Handle location errors
export function watchMerchantPositionError(error) {
  console.error('Location error:', {
    code: error.code,
    message: error.message,
    details: error,
  });
  return error;
}

// Background task details

export const backgroundNotificationOption = {
  taskName: 'LocationTracking',
  taskTitle: 'Tracking in Background',
  taskDesc: 'We’re tracking your location to update your ride status.',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#000000',
  parameters: {
    delay: 1000,
  },
  linkingURI: 'trackingapp://home',
};
