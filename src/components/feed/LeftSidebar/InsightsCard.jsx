import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../../../services/authAPI";
import { getUserPosts } from "../../../services/postAPI";

const InsightsCard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchAllPosts = async (userId) => {
      let allPosts = [];
      let nextUrl = null;

      try {
        // first call
        let res = await getUserPosts(userId);
        let data = res.data;
        let posts = data.results ?? data.posts ?? (Array.isArray(data) ? data : []);
        allPosts = [...posts];
        nextUrl = data.next;

        // keep fetching next pages
        while (nextUrl) {
          const nextRes = await fetch(nextUrl, { credentials: "include" });
          const nextData = await nextRes.json();
          const nextPosts =
            nextData.results ?? nextData.posts ?? (Array.isArray(nextData) ? nextData : []);
          allPosts = [...allPosts, ...nextPosts];
          nextUrl = nextData.next;
        }
      } catch (err) {
        console.error("❌ Failed to fetch all posts:", err);
      }

      return allPosts;
    };

    const load = async () => {
      try {
        const userRes = await getCurrentUser();
        if (!mounted) return;
        const userData = userRes?.data;
        setUser(userData);

        if (userData?.id) {
          const allPosts = await fetchAllPosts(userData.id);
          if (mounted) setPostCount(allPosts.length);
        }
      } catch (err) {
        console.error("❌ Failed to load insights:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="dark:bg-zinc-900 shadow-md rounded-2xl p-4">
        <h3 className="text-md font-medium mb-4">Profile Insights</h3>
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dark:bg-zinc-900 shadow-md rounded-2xl p-4">
        <h3 className="text-md font-medium mb-4">Profile Insights</h3>
        <p className="text-sm text-zinc-400">No user data</p>
      </div>
    );
  }

  return (
    <div className="dark:bg-zinc-900 shadow-md rounded-2xl p-4">
      <h3 className="text-md font-medium mb-4">Profile Insights</h3>
      <div className="flex justify-between text-sm text-zinc-400">
        <div className="text-center">
          <p className="font-semibold text-white text-lg">{postCount}</p>
          <p>Posts</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-white text-lg">
            {user?.followers?.length ?? 0}
          </p>
          <p>Followers</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-white text-lg">
            {user?.following?.length ?? 0}
          </p>
          <p>Following</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
