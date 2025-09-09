/* eslint-disable no-unused-vars */
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineDotsVertical } from "react-icons/hi";
import apiClient from "../../../services/apiClient";
import {
  selectIsFollowing,
  selectFollowLoading,
  setFollowState,
  setFollowLoading,
} from "../../../redux/slices/followSlice";

// ---------------- Confirm Unfollow Dialog ----------------
function ConfirmUnfollowDialog({ open, onClose, onConfirm, username }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-zinc-900 rounded-xl p-6 shadow-xl w-full max-w-xs text-center border border-zinc-700">
        <h3 className="text-lg font-semibold text-white mb-2">Confirm Unfollow</h3>
        <p className="text-gray-300 mb-4">
          Are you sure you want to unfollow{" "}
          <span className="font-bold text-purple-400">@{username}</span>?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Unfollow
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Post Card ----------------
const PostCard = ({ post, activeTab, onUnfollowUser, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const isFollowing = useSelector((state) =>
    selectIsFollowing(state, post.author_profile.id)
  );
  const followLoading = useSelector((state) =>
    selectFollowLoading(state, post.author_profile.id)
  );

  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarLetter = post?.author_profile?.username?.[0]?.toUpperCase() || "U";

  // ---------------- Like Handler ----------------
  const toggleLike = async () => {
    try {
      if (isLiked) {
        await apiClient.post(`/posts/${post.id}/unlike/`);
        setLikesCount((c) => c - 1);
      } else {
        await apiClient.post(`/posts/${post.id}/like/`);
        setLikesCount((c) => c + 1);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("❌ Like toggle failed:", err);
    }
  };

  // ---------------- Follow Handler ----------------
  const toggleFollow = async () => {
    if (followLoading) return;

    const userId = post.author_profile.id;
    const newFollowState = !isFollowing;

    dispatch(setFollowLoading({ userId, loading: true }));
    dispatch(setFollowState({ userId, isFollowing: newFollowState }));

    try {
      if (isFollowing) {
        await apiClient.post(`/accounts/unfollow/${userId}/`);
      } else {
        await apiClient.post(`/accounts/follow/${userId}/`);
      }
      dispatch(setFollowLoading({ userId, loading: false }));
    } catch (err) {
      console.error("❌ Follow toggle failed:", err);
      dispatch(setFollowState({ userId, isFollowing: !newFollowState }));
      dispatch(setFollowLoading({ userId, loading: false }));
    }
  };

  const handleFollowClick = () => {
    if (isFollowing) {
      setShowUnfollowDialog(true);
    } else {
      toggleFollow();
    }
  };

  const handleConfirmUnfollow = async () => {
    setShowUnfollowDialog(false);
    await toggleFollow();
    if (activeTab === "following" && typeof onUnfollowUser === "function") {
      onUnfollowUser(post.author_profile.id);
    }
  };

  // ---------------- Comment Submit ----------------
  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await apiClient.post(`/posts/${post.id}/comment/`, {
        content: newComment,
      });

      const newC = { ...res.data, user: currentUser };
      setComments((prev) => [...prev, newC]);
      setNewComment("");
    } catch (err) {
      console.error("❌ Failed to add comment:", err);
    }
  };

  // ---------------- View Counter ----------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          try {
            await apiClient.post(`/posts/${post.id}/view/`);
          } catch (err) {
            console.error("❌ Failed to mark view", err);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    const el = document.getElementById(`post-${post.id}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [post.id]);

  const isOwnPost = currentUser?.id === post.author_profile?.id;

  return (
    <div
      id={`post-${post.id}`}
      className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-md p-4 mb-6 w-full max-w-3xl mx-auto relative"
    >
      {/* -------- Header -------- */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {post?.author_profile?.profile_photo ? (
            <img
              src={post.author_profile.profile_photo}
              alt={post.author_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {avatarLetter}
            </div>
          )}
          <div>
            <p className="font-semibold text-white">
              {post.author_profile?.full_name || post.author_name}
            </p>
            <p className="text-xs text-gray-400">
              @{post.author_name} •{" "}
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Right side: Follow OR Menu */}
        {!isOwnPost ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleFollowClick}
            disabled={followLoading}
            className={`px-4 py-2 text-sm rounded-full border transition-all font-medium min-w-[80px] ${
              isFollowing
                ? "bg-transparent text-white border-green-600 hover:bg-red-600 hover:border-red-600 hover:text-white"
                : "bg-transparent text-blue-400 border-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600"
            } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </motion.button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <HiOutlineDotsVertical size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-20">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(post);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(post);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-neutral-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* -------- Body -------- */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-1 text-white">{post.title}</h3>
        <p className="text-sm text-gray-300 mb-2">{post.description}</p>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full rounded-lg object-cover max-h-80"
          />
        )}

        {post.external_link && (
          <a
            href={post.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline block mt-2"
          >
            🔗 {post.external_link}
          </a>
        )}
      </div>

      {/* -------- Footer -------- */}
      <div className="flex justify-between text-sm text-gray-400 pt-2 border-t border-neutral-700">
        <button
          className={`transition ${isLiked ? "text-pink-500" : "hover:text-pink-400"}`}
          onClick={toggleLike}
        >
          {isLiked ? "❤️" : "🤍"} {likesCount}
        </button>

        <button
          className="hover:text-blue-400"
          onClick={() => setShowComments((s) => !s)}
        >
          💬 {comments.length}
        </button>

        <span>👁️ {post.views_count}</span>
        <span className="text-xs px-2 py-1 bg-neutral-800 rounded">
          {post.category ? post.category : "General"}
        </span>
      </div>

      {/* -------- Comments Section -------- */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
              {/* Add Comment */}
              <form onSubmit={submitComment} className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-neutral-800 text-white text-sm px-3 py-2 rounded-full focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
                >
                  Post
                </button>
              </form>

              {/* Comment List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 comment-scroll">
                {comments.length > 0 ? (
                  comments.map((c) => {
                    const commenter = c.user || c.author_profile;
                    const avatarLetter =
                      commenter?.username?.[0]?.toUpperCase() || "U";

                    return (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 bg-neutral-800/50 p-2 rounded-lg border border-neutral-700"
                      >
                        {commenter?.profile_photo ? (
                          <img
                            src={commenter.profile_photo}
                            alt={commenter.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {avatarLetter}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white leading-none">
                            {commenter?.full_name || commenter?.username || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-400 leading-none">
                            @{commenter?.username} •{" "}
                            {c.created_at
                              ? formatDistanceToNow(new Date(c.created_at), {
                                  addSuffix: true,
                                })
                              : "just now"}
                          </span>
                          <p className="text-sm text-gray-300 mt-1">{c.content}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Unfollow Dialog */}
      <ConfirmUnfollowDialog
        open={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
        onConfirm={handleConfirmUnfollow}
        username={post.author_profile?.username || post.author_name}
      />
    </div>
  );
};

export default PostCard;
