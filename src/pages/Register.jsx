/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/authAPI';


const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address.';

    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try { 
    setLoading(true);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };
    console.log("📦 Sending to backend:", payload);

    await registerUser(payload);

    toast.success("Registration Successful! Please login.");
    navigate("/login");
  } catch (err) {
    console.error("❌ Registration failed:", err.response?.data || err.message);

    // Extract detailed error messages from Django
    if (err.response?.data) {
      const errors = err.response.data;
      if (errors.username) {
        toast.error(`Username: ${errors.username[0]}`);
      } else if (errors.email) {
        toast.error(`Email: ${errors.email[0]}`);
      } else if (errors.password) {
        toast.error(`Password: ${errors.password[0]}`);
      } else if (errors.error) {
        toast.error(errors.error);
      } else {
        toast.error("Registration failed. Please check your input.");
      }
    } else {
      toast.error("Server error. Please try again later.");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-b from-neutral-600 via-neutral-300 to-purple-500 bg-clip-text text-transparent">
          Begin Your SkillSync Journey
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="mb-6 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg transition ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center text-white mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">
    Login
  </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
