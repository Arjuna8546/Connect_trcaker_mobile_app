// axiosInstance.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {HTTP_BACKEND_URL } from '@env';

const axiosInstance = axios.create({
  baseURL: `${HTTP_BACKEND_URL}/api/mobile/`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to each request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = await AsyncStorage.getItem('refresh');
        const res = await axios.post(`${HTTP_BACKEND_URL}/api/mobile/token/refresh/`, {
          refresh: refresh,
        });

        if (res.data.success && res.data.access) {
          const newAccessToken = res.data.access;
          await AsyncStorage.setItem('access', newAccessToken);

          // Update headers for future requests
          axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest); // Retry the original request
        } else {
          // If refresh fails, clear storage
          await AsyncStorage.multiRemove(['access', 'refresh', 'user']);
          console.log("Refresh token invalid or expired.");
          return Promise.reject(res);
        }

      } catch (refreshErr) {
        await AsyncStorage.multiRemove(['access', 'refresh', 'user']);
        console.log("Token refresh failed: ", refreshErr);
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
