// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import followReducer from './slices/followSlice'; // Import the new follow slice

const store = configureStore({
  reducer: {
    auth: authReducer,
    follow: followReducer, // Add the follow slice
  },
});

export default store;