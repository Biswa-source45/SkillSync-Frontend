/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "../../services/apiClient";

// small debounce hook
function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SearchDialog({ isOpen, onClose, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'posts'
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [firedOnce, setFiredOnce] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  // reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || "");
      setActiveTab("users");
      setUsers([]);
      setPosts([]);
      setFiredOnce(false);
      // autofocus input after mount
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
    }
  }, [isOpen, initialQuery]);

  // fetch helper
  const fetchSearch = async (q) => {
    if (!q || q.trim().length < 2) {
      setUsers([]);
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get(`/search/`, { params: { q } });
      setUsers(res.data?.users || []);
      setPosts(res.data?.posts || []);
      setFiredOnce(true);
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // debounced search as you type
  useEffect(() => {
    if (!isOpen) return;
    fetchSearch(debouncedQuery);
  }, [debouncedQuery, isOpen]);

  // enter key = immediate fetch
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchSearch(query);
    }
    if (e.key === "Escape") {
      onClose?.();
    }
  };

  // click outside to close
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // helpers for avatars
  const renderAvatar = (photo, username, size = 36) => {
    const letter = username?.[0]?.toUpperCase() || "U";
    return photo ? (
      <img
        src={photo}
        alt={username}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full bg-purple-600 text-white font-semibold flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {letter}
      </div>
    );
  };

  // Navigate routes (adjust to your app’s routes if different)
  const goToUser = (u) => {
    // if your app uses /profile/:username, keep this:
    navigate(`/profile/${u.username}`);
    onClose?.();
  };
  const goToPost = (p) => {
    // if your app uses /post/:id, keep this:
    navigate(`/post/${p.id}`);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onBackdropClick}
        >
          <motion.div
            className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Top row: Search input + close */}
            <div className="flex items-center gap-3 p-3 border-b border-neutral-800">
              <div className="flex-1 flex items-center gap-3 bg-neutral-800 rounded-full px-3 py-2">
                <span className="text-gray-400">🔎</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search users or posts..."
                  className="bg-transparent text-white placeholder:text-gray-400 w-full focus:outline-none"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="shrink-0 px-3 py-2 text-gray-300 hover:text-white"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            {/* Tabs */}
            <div className="relative">
              <div className="flex gap-1 p-2">
                {["users", "posts"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 px-4 py-2 text-center rounded-lg transition-colors ${
                      activeTab === tab
                        ? "text-white font-semibold bg-purple-600/30"
                        : "text-gray-400 hover:text-white hover:bg-neutral-800/60"
                    }`}
                  >
                    {tab === "users" ? "Users" : "Posts"}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto p-2 md:p-3 comment-scroll">
              {loading && (
                <div className="p-6 text-center text-gray-400">Searching…</div>
              )}

              {!loading && query.trim().length < 2 && (
                <div className="p-6 text-center text-gray-500">
                  Type at least 2 characters to search.
                </div>
              )}

              {!loading && query.trim().length >= 2 && firedOnce && activeTab === "users" && (
                <>
                  {users.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No users found.</div>
                  ) : (
                    <ul className="divide-y divide-neutral-800">
                      {users.map((u) => (
                        <li
                          key={u.id}
                          className="flex items-center gap-3 p-3 hover:bg-neutral-800/60 rounded-lg cursor-pointer"
                          onClick={() => goToUser(u)}
                        >
                          {renderAvatar(u.profile_photo, u.username, 40)}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {u.full_name || u.username}
                            </div>
                            <div className="text-xs text-gray-400 truncate">@{u.username}</div>
                          </div>
                          <span className="text-gray-500 text-sm">View</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {!loading && query.trim().length >= 2 && firedOnce && activeTab === "posts" && (
                <>
                  {posts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No posts found.</div>
                  ) : (
                    <ul className="space-y-2">
                      {posts.map((p) => (
                        <li
                          key={p.id}
                          className="p-3 bg-neutral-800/50 border border-neutral-800 rounded-xl hover:bg-neutral-800 cursor-pointer"
                          onClick={() => goToPost(p)}
                        >
                          <div className="flex gap-3">
                            {/* Thumbnail (if any) */}
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-neutral-700 flex items-center justify-center text-gray-300 text-xs">
                                No Image
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold truncate">{p.title}</div>
                              <div className="text-xs text-gray-400">
                                @{p.author_name} •{" "}
                                {p.created_at
                                  ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true })
                                  : ""}
                              </div>
                              {p.description && (
                                <div className="text-sm text-gray-300 line-clamp-2 mt-1">
                                  {p.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
