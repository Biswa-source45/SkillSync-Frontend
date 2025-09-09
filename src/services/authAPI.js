import apiClient from "./apiClient";

const API_BASE_URL = "/accounts"; // ✅ baseURL is already set in apiClient

export const registerUser = (data) => apiClient.post(`${API_BASE_URL}/register/`, data);
export const loginUser = (data) => apiClient.post(`${API_BASE_URL}/login/`, data);
export const refreshToken = () => apiClient.post(`${API_BASE_URL}/refresh/`);

export const getCurrentUser = () => apiClient.get("/accounts/profile/");

export const logoutUser = () =>
  apiClient.post("/accounts/logout/", {});
