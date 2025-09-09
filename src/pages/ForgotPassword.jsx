// src/components/auth/ForgotPassword.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  requestPasswordReset,
  verifyOtp,
  resetPassword,
} from "../services/accountAPI"

const Spinner = ({ size = 4 }) => (
  <div
    className={`w-${size} h-${size} border-2 border-neutral-600 border-t-white rounded-full animate-spin`}
    aria-hidden
  />
);

// helper - simple email check
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

export default function ForgotPassword() {
  const navigate = useNavigate();

  // steps: email -> otp -> reset -> done
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [allowResend, setAllowResend] = useState(false);

  // Start a 60s resend countdown
  useEffect(() => {
    let t;
    if (resendSeconds > 0) {
      t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    } else if (resendSeconds === 0) {
      setAllowResend(true);
    }
    return () => clearTimeout(t);
  }, [resendSeconds]);

  // Step 1: request OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!isValidEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      toast.success(res?.data?.message ?? "OTP sent to your email");
      setStep("otp");
      setAllowResend(false);
      setResendSeconds(60); // 60s cooldown before resend
    } catch (err) {
      console.error("requestPasswordReset error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to send OTP. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!otp || otp.length < 4) {
      setError("Please enter the 4-6 digit OTP sent to your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      toast.success(res?.data?.message ?? "OTP verified");
      setStep("reset");
    } catch (err) {
      console.error("verifyOtp error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Invalid or expired OTP.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: reset password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(email, newPassword);
      toast.success(res?.data?.message ?? "Password reset successful");
      setStep("done");
      // after a short delay, redirect to login
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      console.error("resetPassword error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to reset password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!allowResend) return;
    setError("");
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      toast.success(res?.data?.message ?? "OTP resent");
      setAllowResend(false);
      setResendSeconds(60);
    } catch (err) {
      console.error("resendOtp error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to resend OTP.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // UI pieces
  const StepHeader = () => (
    <div className="mb-4 text-center">
      <h2 className="text-2xl font-semibold text-white">Forgot Password</h2>
      <p className="text-sm text-neutral-400 mt-1">
        We'll send a one-time code to your email to reset your password.
      </p>
    </div>
  );

  const StepIndicator = () => {
    const steps = ["Email", "OTP", "Reset"];
    const currentIndex = { email: 0, otp: 1, reset: 2, done: 2 }[step] ?? 0;
    return (
      <div className="flex items-center justify-center gap-3 mb-4">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                idx <= currentIndex
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {idx + 1}
            </div>
            <div className={`text-xs ${idx <= currentIndex ? "text-white" : "text-neutral-500"}`}>
              {label}
            </div>
            {idx < steps.length - 1 && <div className="w-4 h-[2px] bg-neutral-700 mx-2" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-black via-gray-900 to-purple-900">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md bg-transparent rounded-xl p-6 shadow-md"
      >
        <StepHeader />
        <StepIndicator />

        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-5">
          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <label className="block text-xs text-neutral-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
                required
                autoFocus
              />

              {error && <div className="text-xs text-red-400">{error}</div>}

              <div className="flex items-center justify-between gap-3">
                <Link to="/login" className="text-sm text-neutral-400 hover:underline">
                  Back to login
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className={`ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium ${
                    loading ? "bg-purple-600/70 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                >
                  {loading ? <Spinner size={4} /> : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <p className="text-sm text-neutral-300">
                  OTP sent to <span className="font-medium text-white">{email}</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">Enter the code below.</p>
              </div>

              <label className="block text-xs text-neutral-300">OTP</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
                autoFocus
                required
              />

              {error && <div className="text-xs text-red-400">{error}</div>}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                  }}
                  className="text-sm text-neutral-400 hover:underline"
                >
                  Use different email
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!allowResend || loading}
                    className={`text-sm px-3 py-2 rounded-md ${
                      allowResend && !loading
                        ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                        : "bg-neutral-800/60 text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    {allowResend ? "Resend OTP" : `Resend in ${resendSeconds}s`}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium ${
                      loading ? "bg-purple-600/70 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                    } text-white`}
                  >
                    {loading ? <Spinner size={4} /> : "Verify OTP"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <p className="text-sm text-neutral-300">Set a new password for <span className="font-medium text-white">{email}</span></p>
              </div>

              <label className="block text-xs text-neutral-300">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
                autoFocus
                required
                minLength={8}
              />

              <label className="block text-xs text-neutral-300">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
                required
                minLength={8}
              />

              {error && <div className="text-xs text-red-400">{error}</div>}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  className="text-sm text-neutral-400 hover:underline"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium ${
                    loading ? "bg-purple-600/70 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                >
                  {loading ? <Spinner size={4} /> : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-white">Password updated</h3>
              <p className="text-sm text-neutral-400 mt-2">You will be redirected to login shortly.</p>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
