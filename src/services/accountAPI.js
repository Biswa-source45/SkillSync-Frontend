import apiClient from "./apiClient";

export const requestPasswordReset = (email) =>
  apiClient.post("/accounts/forgot-password/", { email });

export const verifyOtp = (email, otp) =>
  apiClient.post("/accounts/verify-otp/", { email, otp });

export const resetPassword = (email, new_password) =>
  apiClient.post("/accounts/reset-password/", { email, new_password });