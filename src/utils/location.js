import Geolocation from 'react-native-geolocation-service';

// Watch user’s location
export const watchMerchantPosition = (successFn, errorFn) => {
  console.log('watchMerchantPosition called');
  const watchID = Geolocation.watchPosition(successFn, errorFn, {
    accuracy: { android: 'high' },
    enableHighAccuracy: true,
    distanceFilter: 0, // Update on any change (for testing)
    interval: 2000, // Update every 2 seconds
    fastestInterval: 1000, // Fastest update interval
    showLocationDialog: true, // Show dialog if settings need adjustment
    forceRequestLocation: true, // Force location request
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
    name: 'ic_launcher', // Should exist in android/app/src/main/res/mipmap
    type: 'mipmap',
  },
  color: '#000000',
  parameters: {
    delay: 1000,
  },
  linkingURI: 'trackingapp://home',
};
