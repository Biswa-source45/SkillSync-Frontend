import apiClient from "./apiClient";

export const getUserPosts = (userId) =>
  apiClient.get(`/accounts/users/${userId}/posts/`);

export const updatePost = (postId, data) =>
  apiClient.patch(`/posts/${postId}/`, data);

export const deletePost = (postId) =>
  apiClient.delete(`/posts/${postId}/`);


