/* eslint-disable no-unused-vars */
import axios from 'axios';
import store from '../redux/store';
import {
  clearAuth,
  setAuth,
  setCurrentUser,
  startLoading,
  stopLoading,
} from '../redux/slices/authSlice';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ sends cookies (refresh_token)
});

// ============================
// Request Interceptor
// ============================
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// Response Interceptor
// ============================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Prevent infinite loop: only retry once and not for refresh endpoint
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh/')  // ✅ Don't retry refresh requests
    ) {
      originalRequest._retry = true;
      
      try {
        // ✅ Call backend refresh endpoint directly
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/accounts/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.access;
        if (newAccessToken) {
          store.dispatch(setAuth(newAccessToken));
          
          // ✅ Update the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // ✅ Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError.response?.status);
        store.dispatch(clearAuth());
        // Don't redirect here - let the component handle it
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;