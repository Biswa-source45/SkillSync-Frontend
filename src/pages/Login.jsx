/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { getCurrentUser, loginUser } from "../services/authAPI";
import { setAuth, setCurrentUser } from "../redux/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await loginUser({
        username_or_email: formData.usernameOrEmail,
        password: formData.password,
      });

      // Save tokens in cookies
      Cookies.set("access_token", data.access, { expires: 1 });
      Cookies.set("refresh_token", data.refresh, { expires: 7 });

      dispatch(setAuth()); // update redux state as authenticated

      const userProfile = await getCurrentUser();
      dispatch(setCurrentUser(userProfile.data));
      
      toast.success("Login successful! Redirecting...");
      navigate("/feed");
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error || "Invalid username/email or password";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getLoginHint = () => {
    if (!formData.usernameOrEmail) return "";
    return formData.usernameOrEmail.includes("@")
      ? "Logging in with your email."
      : "Logging in with your username.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-transparent   rounded-xl shadow-md p-8"
      >
        {/* HEADER */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Login to Your Account
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Welcome back! Please enter your info.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* USERNAME OR EMAIL */}
          <div className="mb-4">
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Enter your username or email"
              value={formData.usernameOrEmail}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
            />
            {getLoginHint() && (
              <p className="text-xs text-gray-400 mt-1">{getLoginHint()}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-2">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* FORGOT PASSWORD */}
          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-purple-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition focus:outline-none ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* LINK TO REGISTER */}
        <div className="text-center mt-6">
          <p className="text-sm text-white">
            Don’t have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:underline">
              Register Now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;