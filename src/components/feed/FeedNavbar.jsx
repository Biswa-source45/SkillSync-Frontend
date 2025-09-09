/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, getCurrentUser } from "../../services/authAPI";
import { clearAuth } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo transparrent.png";
import avatar from "../../assets/default1.jpg";
import LeftSidebar from "./LeftSidebar";
import CreatePostDialog from "../CreatePostDialog";
import { toast } from "sonner";
import SearchDialog from "./SearchDialog";

const FeedNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Search dialog state
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearchValue, setNavSearchValue] = useState("");
  const desktopInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(clearAuth());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() || "U";

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = () => setDropdownOpen(false);
    window.addEventListener("click", handle);
    return () => window.removeEventListener("click", handle);
  }, [dropdownOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  // ✅ Handle post result from dialog
  const handlePostCreated = (success) => {
    setCreatePostOpen(false); // close the dialog first
    setTimeout(() => {
      if (success) {
        toast.success("✅ Post created successfully! Refreshing feed...");
        window.location.reload();
      } else {
        toast.error("❌ Post failed. Please try again.");
      }
    }, 200);
  };

  // open search dialog from desktop input
  const openSearchWithValue = () => {
    setSearchOpen(true);
  };

  // submit with Enter on navbar input
  const onNavSearchKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      openSearchWithValue();
    }
  };

  return (
    <>
      {/* Navbar */}
      <div className="w-full px-4 md:px-8 py-3 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center relative z-30">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-white/10">
            <img src={logo} alt="logo" className="h-8 w-8 object-contain" />
          </div>
          <h1 className="text-white font-bold text-xl tracking-tight">
            SkillSync
          </h1>
        </div>

        {/* Center: Search (desktop) */}
        <div className="hidden md:flex w-1/3">
          <div className="flex items-center gap-3 bg-neutral-800 rounded-full px-3 py-2 w-full">
            <span className="text-gray-400">🔎</span>
            <input
              ref={desktopInputRef}
              type="text"
              value={navSearchValue}
              onChange={(e) => setNavSearchValue(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onNavSearchKey}
              placeholder="Search users or posts..."
              className="w-full bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
            />
            {navSearchValue && (
              <button
                className="text-gray-400 hover:text-gray-200"
                onClick={() => setNavSearchValue("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Nav (desktop) */}
        <div className="hidden md:flex items-center gap-4 relative">
          <Link
            to="/feed"
            className="text-white text-sm px-4 py-2 rounded-full hover:bg-neutral-800 hover:text-purple-400 transition"
          >
            Home
          </Link>
          <button
            onClick={() => setCreatePostOpen(true)}
            className="text-white text-sm px-4 py-2 rounded-full hover:bg-neutral-800 hover:text-purple-400 transition"
          >
            Create Post
          </button>

          {/* User Dropdown */}
          <div className="relative select-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((val) => !val);
              }}
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-neutral-700 hover:ring-2 hover:ring-purple-500 transition"
            >
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = avatar;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {avatarLetter}
                </div>
              )}
            </button>

            {/* Dropdown Content */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg p-4 z-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={user?.profile_photo || avatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover border border-neutral-600"
                    />
                    <div>
                      <p className="text-white font-semibold">
                        {user?.full_name || "User"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        @{user?.username || ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-red-400 border hover:text-red-500 py-2 rounded-md font-semibold"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-3">
          {/* Mobile search button */}
          <button
            className="text-white text-xl"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            🔎
          </button>

          {/* Mobile menu toggle */}
          <button
            className="text-white text-2xl"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 w-4/5 h-full bg-neutral-900 z-40 shadow-2xl flex flex-col"
          >
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <button
                className="self-end text-2xl text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>

              {/* Mobile: quick search opener */}
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-white text-lg py-2 border-b border-neutral-800 hover:text-purple-400 text-left"
              >
                Search
              </button>

              <Link
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-lg py-2 border-b border-neutral-800 hover:text-purple-400"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  setCreatePostOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-white text-lg py-2 border-b border-neutral-800 hover:text-purple-400 text-left"
              >
                Create Post
              </button>

              {/* Sidebar content (includes big profile card) */}
              <div className="mt-6">
                <LeftSidebar />
              </div>
            </div>

            {/* Logout button pinned at bottom */}
            <div className="p-6 border-t border-neutral-800">
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* 🔎 Search Dialog */}
      <SearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        initialQuery={navSearchValue}
      />
    </>
  );
};

export default FeedNavbar;
