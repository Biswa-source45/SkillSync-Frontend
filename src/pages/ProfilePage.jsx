/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getCurrentUser } from "../services/authAPI";
import { getUserPosts, updatePost, deletePost } from "../services/postAPI";
import FeedNavbar from "../components/feed/FeedNavbar";
import EditProfileDialog from "../components/feed/Profiledata/EditProfileDialog";
import EditPostDialog from "../components/feed/EditPostDialog";
import ConfirmDeleteDialog from "../components/feed/ConfirmDeleteDialog";
import PostCard from "../components/feed/CenterContent/PostCard";
import { toast, Toaster } from "sonner";
import { setCurrentUser } from "../redux/slices/authSlice";

const Loader = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white">
    <svg
      className="animate-spin h-12 w-12 text-purple-500 mb-4"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
    <span className="text-lg">Loading profile...</span>
  </div>
);

const AvatarBlock = ({ user }) => {
  const avatarLetter = user?.username?.[0]?.toUpperCase() || "U";
  return user?.profile_photo ? (
    <img
      src={user.profile_photo}
      alt="Profile"
      className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
    />
  ) : (
    <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center text-3xl font-bold">
      {avatarLetter}
    </div>
  );
};

const StatBox = ({ label, count }) => (
  <div className="flex flex-col items-center px-4 py-2 bg-neutral-800 rounded-xl">
    <span className="text-lg font-bold text-white">{count}</span>
    <span className="text-xs text-zinc-400">{label}</span>
  </div>
);

const UserDetailRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-zinc-700 pb-2">
    <span>{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [posts, setPosts] = useState([]);
  const [postsCount, setPostsCount] = useState(0); // ✅ total posts
  const [nextPage, setNextPage] = useState(null); // ✅ pagination next
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [deletePostData, setDeletePostData] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // ---------------- Load User ----------------
  useEffect(() => {
    const loadUser = async () => {
      if (!currentUser) {
        try {
          const res = await getCurrentUser();
          dispatch(setCurrentUser(res.data));
        } catch (err) {
          toast.error("Failed to load user profile");
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [dispatch, currentUser, refresh]);

  // ---------------- Load First Page of Posts ----------------
  useEffect(() => {
    if (!currentUser?.id) return;

    setPosts([]);
    setNextPage(null);
    getUserPosts(currentUser.id)
      .then((res) => {
        setPosts(res.data.results || []);
        setPostsCount(res.data.count || 0); // ✅ total count
        setNextPage(res.data.next || null);
      })
      .catch(() => toast.error("Failed to load posts"));
  }, [currentUser?.id, refresh]);

  // ---------------- Load More Posts on Scroll ----------------
  const loadMorePosts = useCallback(() => {
    if (!nextPage || loadingMore) return;

    setLoadingMore(true);
    // use apiClient directly, since nextPage is full URL
    import("../services/apiClient").then(({ default: apiClient }) => {
      apiClient
        .get(nextPage.replace(import.meta.env.VITE_API_BASE_URL, "")) // ✅ strip baseURL duplication
        .then((res) => {
          setPosts((prev) => [...prev, ...(res.data.results || [])]);
          setNextPage(res.data.next || null);
        })
        .catch(() => toast.error("Failed to load more posts"))
        .finally(() => setLoadingMore(false));
    });
  }, [nextPage, loadingMore]);

  // ---------------- Infinite Scroll Listener ----------------
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        nextPage &&
        !loadingMore
      ) {
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextPage, loadingMore, loadMorePosts]);

  if (loading) return <Loader />;
  if (!currentUser)
    return (
      <div className="bg-neutral-950 text-white flex items-center justify-center h-screen">
        Failed to load profile.
      </div>
    );

  const needsCompletion =
    !currentUser.profile_photo ||
    !currentUser.bio?.trim() ||
    !currentUser.gender?.trim() ||
    !currentUser.role?.trim() ||
    !currentUser.full_name?.trim();

  // ---------------- Handlers ----------------
  const handleUpdatePost = async (id, data) => {
    try {
      await updatePost(id, data);
      toast.success("Post updated!");
      setRefresh((r) => !r);
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deletePost(id);
      toast.success("Post deleted!");
      setDeletePostData(null);
      setRefresh((r) => !r);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="bg-neutral-950 min-h-screen text-white">
      <Toaster position="top-right" richColors />
      <FeedNavbar />

      <div className="w-full max-w-3xl mx-auto mt-8 px-2 sm:px-4">
        {/* ---------- Profile Block ---------- */}
        <div className="relative">
          <div className="flex justify-end gap-2 absolute right-2 top-2 z-10">
            {needsCompletion && (
              <button
                onClick={() => setOpenDialog(true)}
                className="animate-pulse bg-purple-600 hover:bg-purple-700 cursor-pointer text-white text-sm px-4 py-1 rounded-full shadow-md transition"
              >
                Complete Profile
              </button>
            )}
            <button
              onClick={() => setOpenDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded-full shadow-md transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center gap-2">
              <AvatarBlock user={currentUser} />
              <h2 className="text-2xl font-semibold">
                @{currentUser.username}
              </h2>
              <p className="text-zinc-400 text-center text-sm">
                {currentUser.bio?.trim() || "No bio provided."}
              </p>
              <p className="text-lg font-bold mt-1">
                {currentUser.full_name || ""}
              </p>
            </div>

            <div className="flex flex-wrap justify-around mt-6 mb-4 gap-2">
              <StatBox label="Posts" count={postsCount} /> {/* ✅ real total */}
              <StatBox
                label="Followers"
                count={currentUser.followers?.length || 0}
              />
              <StatBox
                label="Following"
                count={currentUser.following?.length || 0}
              />
            </div>

            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <UserDetailRow
                label="Email:"
                value={currentUser.email || "Not provided"}
              />
              <UserDetailRow
                label="Gender:"
                value={currentUser.gender || "Not specified"}
              />
              <UserDetailRow
                label="Role:"
                value={currentUser.role || "Member"}
              />
            </div>

            {currentUser.interests?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm text-zinc-400 mb-2">Interests:</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------- User Posts ---------- */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(p) => setEditPost(p)}
                  onDelete={(p) => setDeletePostData(p)}
                />
              ))}
              {loadingMore && (
                <p className="text-center text-zinc-400 mt-4">
                  Loading more posts...
                </p>
              )}
            </>
          ) : (
            <p className="text-zinc-400">No posts yet.</p>
          )}
        </div>
      </div>

      {/* ---------- Dialogs ---------- */}
      {openDialog && (
        <EditProfileDialog
          user={currentUser}
          onClose={() => setOpenDialog(false)}
          onUpdate={() => {
            setRefresh((r) => !r);
            toast.success("Profile updated successfully!");
          }}
        />
      )}

      {editPost && (
        <EditPostDialog
          post={editPost}
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
};

export default ProfilePage;
