
import React, { useEffect, useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import BackgroundJob from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { checkAndRequestPermissions } from '../../utils/permissions';
import {
    watchMerchantPosition,
    watchMerchantPositionError,
    watchMerchantPositionSuccess,
    backgroundNotificationOption
} from '../../utils/location';
import axiosInstance from '../../axiosInstance/axiosInstance';
import { HTTP_BACKEND_URL,WS_BACKEND_URL } from '@env';

export default function HomeScreen({ navigation }) {
    const watchId = useRef(null);
    const [isTracking, setIsTracking] = useState(false);
    const [user, setUserData] = useState(null)
    const [rides, setRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const ws = useRef(null);

    //notification
    async function createAndroidChannel() {
        await notifee.createChannel({
            id: 'location-tracking',
            name: 'Location Tracking',
            importance: AndroidImportance.HIGH,
        });
    }

    const getUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('user');
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Failed to fetch user data', error);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.replace('signin'); // or navigate to your login screen

    };

    const getRides = async (user_id) => {
        try {
            const response = await axiosInstance.get(`${HTTP_BACKEND_URL}/api/mobile/rides/${user_id}`);
            const rideData = response?.data.rides;
            if (Array.isArray(rideData)) {
                setRides(rideData);
            } else {
                console.warn("Expected ride data to be an array, but got:", rideData);
                setRides([]); // fallback to empty array
            }
        } catch (error) {
            console.error("Failed to fetch rides", error);
            setRides([]);
        }
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
            const userData = await getUserData();

            if (userData) {
                setUserData(userData)
                await getRides(userData.id);
            }
            if (!granted) {
                console.log('Cannot start tracking without permissions.');
            }
        };
        requestPerms();

        createAndroidChannel();
    }, []);

    const establishWebsocket = () => {
        if (ws.current) {
            console.log('WebSocket already established');
            return;
        }
        if (selectedRide) {
            ws.current = new WebSocket(`${WS_BACKEND_URL}/ws/location/${selectedRide.id}/?user_id=${user.id}`);

            ws.current.onopen = () => {
                console.log('WebSocket connection opened');
            };
            ws.current.onerror = (e) => {
                console.log('WebSocket error:', e.message);
            };

            ws.current.onclose = (e) => {
                console.log('WebSocket closed:', e.code, e.reason);
                ws.current = null;
            };
        }
        else {
            Alert.alert("Please select the ride that your gpoing to start ride")
        }
    };

    const closeWebsocket = () => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
            console.log('WebSocket connection closed manually');
        } else {
            console.log('No WebSocket connection to close');
        }
    };

    // Start background tracking
    const startBackgroundTracking = async () => {
        if (selectedRide) {
            if (isTracking || BackgroundJob.isRunning()) {
                console.log('Tracking already running');
                return;
            }
            try {
                // Clear any existing watcher
                establishWebsocket()
                if (watchId.current) {
                    Geolocation.clearWatch(watchId.current);
                    watchId.current = null;
                }
                setIsTracking(true);
                await BackgroundJob.start(async () => {
                    console.log('Background job started');
                    watchId.current = watchMerchantPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const timestamp = new Date().toISOString();

                            console.log('New position:', latitude, longitude, timestamp);

                            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                const payload = {
                                    latitude,
                                    longitude,
                                    timestamp,
                                };

                                try {
                                    ws.current.send(JSON.stringify(payload));
                                    console.log(' Sent location to WebSocket:', payload);
                                } catch (err) {
                                    console.error(' WebSocket send error:', err);
                                }
                            } else {
                                console.warn(' WebSocket is not open. Skipping send.');
                            }
                        },
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
                        console.log('Cleared watcher ID at task end:', watchId.current);
                        watchId.current = null;
                    }
                }, backgroundNotificationOption);
                console.log('Background task initiated');
            } catch (error) {
                console.error('Error starting background job:', error);
                setIsTracking(false);
            }
        }
        else {
            Alert.alert("Please select the ride that your gpoing to start ride")
        }
    };

    // Stop background tracking
    const stopBackgroundTracking = async () => {
        closeWebsocket()
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Image source={{ uri: user?.profileUrl }} style={styles.profileIcon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ Main Content */}
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
            <View style={styles.ridesContainer}>
                <Text style={styles.sectionTitle}>Select Ride to Track</Text>
                {rides.length === 0 ? (
                    <Text style={styles.noRidesText}>No rides available</Text>
                ) : (
                    rides.map((ride) => (
                        <TouchableOpacity
                            key={ride.id}
                            style={[
                                styles.rideCard,
                                selectedRide?.id === ride.id && styles.selectedRideCard
                            ]}
                            onPress={() => setSelectedRide(ride)}
                        >
                            <Text style={styles.rideText}>From: {ride.from}</Text>
                            <Text style={styles.rideText}>To: {ride.to}</Text>
                            <Text style={styles.rideText}>Date: {ride.date}</Text>
                        </TouchableOpacity>
                    ))
                )}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    logoutText: {
        color: '#ff5555',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 20,
    },
    infoBox: {
        backgroundColor: '#1c1c1c',
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
    },
    infoText: {
        color: '#bbb',
        fontSize: 14,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 10,
    },
    button: {
        padding: 12,
        borderRadius: 10,
        minWidth: 140,
        alignItems: 'center',
    },
    buttonActive: {
        backgroundColor: '#28a745',
    },
    buttonStop: {
        backgroundColor: '#dc3545',
    },
    buttonDisabled: {
        backgroundColor: '#555',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    footerText: {
        marginTop: 40,
        marginBottom: 40,
        color: '#777',
        fontSize: 12,
        textAlign: 'center',
    },
    ridesContainer: {
        marginTop: 30,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    rideCard: {
        backgroundColor: '#1f1f1f',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    selectedRideCard: {
        borderColor: '#28a745',
        backgroundColor: '#2a2a2a',
    },
    rideText: {
        color: '#ccc',
        fontSize: 14,
    },
    noRidesText: {
        color: '#777',
        fontSize: 14,
        fontStyle: 'italic',
    },

});
