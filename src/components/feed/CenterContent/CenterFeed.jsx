/* eslint-disable no-unused-vars */
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";
import PostCard from "./PostCard";
import { initializeFollowStates } from "../../../redux/slices/followSlice";
import EditPostDialog from "../EditPostDialog";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import { updatePost, deletePost } from "../../../services/postAPI";
import { toast } from "sonner";

const CenterFeed = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("explore");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);

  const [editPost, setEditPost] = useState(null);
  const [deletePostData, setDeletePostData] = useState(null);

  const observer = useRef();
  const isInitialMount = useRef(true);

  // ---------------- Fetch Posts ----------------
  const fetchPosts = useCallback(
    async (url = null, reset = false) => {
      try {
        setLoading(true);
        const endpoint =
          url || (activeTab === "explore" ? "/posts/explore/" : "/posts/following/");
        const res = await apiClient.get(endpoint);

        let newPosts = [];
        if (res.data.results) {
          newPosts = res.data.results;
          setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
          setNextUrl(res.data.next);
        } else if (Array.isArray(res.data)) {
          newPosts = res.data;
          setPosts(newPosts);
          setNextUrl(null);
        }

        if (reset || isInitialMount.current) {
          dispatch(initializeFollowStates(newPosts));
          isInitialMount.current = false;
        }
      } catch (err) {
        console.error(`❌ Failed to fetch ${activeTab} posts:`, err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, dispatch]
  );

  const resetFeedState = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
    setPosts([]);
    setNextUrl(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    resetFeedState();

    const timeoutId = setTimeout(() => {
      fetchPosts(null, true);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [activeTab, fetchPosts, resetFeedState]);

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && nextUrl && !loading) {
            fetchPosts(nextUrl);
          }
        },
        { rootMargin: "100px" }
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, nextUrl, fetchPosts]
  );

  const refreshFeed = useCallback(() => {
    resetFeedState();
    setTimeout(() => {
      fetchPosts(null, true);
    }, 100);
  }, [fetchPosts, resetFeedState]);

  useImperativeHandle(ref, () => ({
    refreshFeed: refreshFeed,
  }));

  const handleTabSwitch = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const handleUnfollowUser = (userId) => {
    if (activeTab === "following") {
      setPosts((prev) => prev.filter((p) => p.author_profile.id !== userId));
    }
  };

  // ---------------- Handlers ----------------
  const handleUpdatePost = async (id, data) => {
    try {
      await updatePost(id, data);
      toast.success("Post updated!");
      refreshFeed();
      setEditPost(null);
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deletePost(id);
      toast.success("Post deleted!");
      refreshFeed();
      setDeletePostData(null);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto scroll-smooth border border-neutral-800 p-4 md:p-2 lg:p-2 bg-neutral-950 rounded-xl">
      {/* Toggle Header */}
      <div className="flex mt-2 w-full bg-neutral-900 rounded-xl mb-4 border border-neutral-800 overflow-hidden sticky top-0 z-10">
        {["explore", "following"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabSwitch(tab)}
            className={`relative flex-1 px-4 py-2 text-center z-10 transition-colors ${
              activeTab === tab ? "text-white font-semibold" : "text-gray-400"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <motion.div
          className="absolute top-0 bottom-0 w-1/2 bg-purple-600/30 rounded-xl"
          initial={false}
          animate={{ x: activeTab === "explore" ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {posts.map((post, index) => {
            const card = (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <PostCard
                  post={post}
                  activeTab={activeTab}
                  onUnfollowUser={handleUnfollowUser}
                  onEdit={(p) => setEditPost(p)}
                  onDelete={(p) => setDeletePostData(p)}
                />
              </motion.div>
            );

            if (posts.length === index + 1) {
              return (
                <div ref={lastPostRef} key={post.id}>
                  {card}
                </div>
              );
            }
            return card;
          })}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="text-center py-4 text-gray-400">Loading more...</div>
      )}

      {/* ---------- Dialogs ---------- */}
      {editPost && (
        <EditPostDialog
          post={editPost}
          open={!!editPost}
          onClose={() => setEditPost(null)}
          onSave={(data) => handleUpdatePost(editPost.id, data)}
        />
      )}

      {deletePostData && (
        <ConfirmDeleteDialog
          open={!!deletePostData}
          onClose={() => setDeletePostData(null)}
          onConfirm={() => handleDeletePost(deletePostData.id)}
        />
      )}
    </div>
  );
});

export default CenterFeed;
