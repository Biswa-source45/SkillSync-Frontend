import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  accessToken: null,
  currentUser: null,
  isLoading: false, // ✅ No initial loading since no auto-check
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.isAuthenticated = true;
      state.accessToken = action.payload;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.currentUser = null;
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
      // When we successfully get user data, we're authenticated
      state.isAuthenticated = true;
    },
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
  }
});

export const {
  setAuth,
  clearAuth,
  setCurrentUser,
  startLoading,
  stopLoading,
} = authSlice.actions;

export default authSlice.reducer;