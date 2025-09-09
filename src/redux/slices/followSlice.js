// redux/slices/followSlice.js
import { createSlice } from '@reduxjs/toolkit';

const followSlice = createSlice({
  name: 'follow',
  initialState: {
    // Store follow states by user ID
    followedUsers: {}, // { userId: true/false }
    loading: {}, // { userId: true/false } - track loading states
  },
  reducers: {
    // Initialize follow states from API data (when posts are loaded)
    initializeFollowStates: (state, action) => {
      // action.payload should be array of posts
      const posts = action.payload;
      posts.forEach(post => {
        if (post.author_profile?.id && typeof post.is_following === 'boolean') {
          // Always update with fresh API data to handle server-side changes
          state.followedUsers[post.author_profile.id] = post.is_following;
        }
      });
    },
    
    // Set follow state for a specific user
    setFollowState: (state, action) => {
      const { userId, isFollowing } = action.payload;
      state.followedUsers[userId] = isFollowing;
      state.loading[userId] = false;
    },
    
    // Set loading state for follow/unfollow action
    setFollowLoading: (state, action) => {
      const { userId, loading } = action.payload;
      state.loading[userId] = loading;
    },
    
    // Force sync with API data (override local state)
    forceSyncFollowStates: (state, action) => {
      const posts = action.payload;
      posts.forEach(post => {
        if (post.author_profile?.id && typeof post.is_following === 'boolean') {
          state.followedUsers[post.author_profile.id] = post.is_following;
        }
      });
    },
    
    // Remove user from follow states (cleanup)
    removeFollowState: (state, action) => {
      const userId = action.payload;
      delete state.followedUsers[userId];
      delete state.loading[userId];
    },
    
    // Clear all follow states (logout, etc.)
    clearFollowStates: (state) => {
      state.followedUsers = {};
      state.loading = {};
    }
  }
});

export const {
  initializeFollowStates,
  setFollowState,
  setFollowLoading,
  forceSyncFollowStates,
  removeFollowState,
  clearFollowStates
} = followSlice.actions;

// Selectors
export const selectIsFollowing = (state, userId) => 
  state.follow.followedUsers[userId] || false;

export const selectFollowLoading = (state, userId) => 
  state.follow.loading[userId] || false;

export const selectAllFollowStates = (state) => 
  state.follow.followedUsers;

export default followSlice.reducer;