/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";

export default function EditPostDialog({ post, onClose, onSave }) {
  const [title, setTitle] = useState(post?.title || "");
  const [description, setDescription] = useState(post?.description || "");
  const [loading, setLoading] = useState(false);

  if (!post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ title, description });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-neutral-900 rounded-xl p-6 w-full max-w-md border border-neutral-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Edit Post</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
            required
          />
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Post description"
            className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500"
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
