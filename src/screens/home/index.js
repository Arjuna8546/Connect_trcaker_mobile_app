
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity  } from 'react-native';
import BackgroundJob from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { checkAndRequestPermissions } from '../../utils/permissions';
import {
  watchMerchantPosition,
  watchMerchantPositionError,
  watchMerchantPositionSuccess,
  backgroundNotificationOption
} from '../../utils/location';

export default function HomeScreen() {
  const watchId = useRef(null);
  const [isTracking, setIsTracking] = useState(false);

  //notification
  async function createAndroidChannel() {
    await notifee.createChannel({
      id: 'location-tracking',
      name: 'Location Tracking',
      importance: AndroidImportance.HIGH,
    });
  }

  async function displayForegroundNotificationStopTrcaking() {
    console.log("notification called")
    await notifee.displayNotification({
      title: 'Tracking Your Ride',
      body: 'Your location  tracking in the background has ended. Please start that it is nessarsary for live tracking',
      android: {
        channelId: 'location-tracking',
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  //checking permission and set channel for notifying
  useEffect(() => {
    const requestPerms = async () => {
      const granted = await checkAndRequestPermissions();
      if (!granted) {
        console.log('Cannot start tracking without permissions.');
      }
    };
    requestPerms();
    createAndroidChannel();
  }, []);

  // Start background tracking
  const startBackgroundTracking = async () => {
    if (isTracking || BackgroundJob.isRunning()) {
      console.log('Tracking already running');
      return;
    }
    try {
      // Clear any existing watcher
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsTracking(true);
      await BackgroundJob.start(async () => {
        console.log('Background job started');
        watchId.current = watchMerchantPosition(
          (position) => watchMerchantPositionSuccess(position),
          (error) => watchMerchantPositionError(error)
        );
        console.log('Watcher active with ID:', watchId.current);
        // Keep task alive
        while (BackgroundJob.isRunning()) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        console.log('Background task ended');
        if (watchId.current !== null) {
          Geolocation.clearWatch(watchId.current);
          console.log('🧹 Cleared watcher ID at task end:', watchId.current);
          watchId.current = null;
        }
      }, backgroundNotificationOption);
      console.log('Background task initiated');
    } catch (error) {
      console.error('Error starting background job:', error);
      setIsTracking(false);
    }
  };

  // Stop background tracking
  const stopBackgroundTracking = async () => {
    displayForegroundNotificationStopTrcaking();
    if (BackgroundJob.isRunning()) {
      await BackgroundJob.stop();
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      console.log('Background tracking stopped');
      setIsTracking(false);
    } else {
      console.log('No tracking to stop');
    }
  };

  // Detect task termination
  useEffect(() => {

    BackgroundJob.on('expiration', () => {
      console.log('Background task terminated by Android');
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsTracking(false);
    });
    return () => {
      // Cleanup on unmount
      console.log("cleanup")
      if (watchId.current) {
        Geolocation.clearWatch(watchId.current);
      }
      BackgroundJob.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONNECT Location Tracking</Text>
      <Text style={styles.subtitle}>
        This feature allows you to share your real-time location with our backend, helping riders and drivers stay connected seamlessly.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          • Location updates are sent securely every few seconds.  
          {'\n'}• Ensure you have granted location permissions.  
          {'\n'}• You can start or stop location tracking anytime.  
          {'\n'}• This helps keep your ride status updated on the Connect carpooling platform.
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.buttonDisabled : styles.buttonActive]}
          onPress={startBackgroundTracking}
          disabled={isTracking}
        >
          <Text style={styles.buttonText}>{isTracking ? 'Tracking...' : 'Start Tracking'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isTracking ? styles.buttonDisabled : styles.buttonStop]}
          onPress={stopBackgroundTracking}
          disabled={!isTracking}
        >
          <Text style={styles.buttonText}>{'Stop Tracking'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Your privacy is our priority. Location data is only used to provide real-time ride updates.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212', // Dark black background
    padding: 24,
    shadowColor: '#7B61FF', // purple shadow
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    flex:1,

  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E0E0E0', // light grayish white
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B0AFFF', // soft purple
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#2A1A59', // dark purple
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    color: '#D9D9FF',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonActive: {
    backgroundColor: '#7B61FF', // vibrant purple
  },
  buttonStop: {
    backgroundColor: '#FF4C61', // pinkish red for stop
  },
  buttonDisabled: {
    backgroundColor: '#555555', // gray for disabled
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    marginTop: 25,
    color: '#9999CC', // soft purple gray
    fontSize: 12,
    textAlign: 'center',
  },
});