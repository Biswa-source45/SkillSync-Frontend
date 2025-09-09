/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageKit from "imagekit-javascript";
import apiClient from "../services/apiClient";

const CreatePostDialog = ({ isOpen, onClose, onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [authParams, setAuthParams] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Fetch ImageKit signed credentials
  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const res = await apiClient.get("/accounts/imagekit-auth/");
        setAuthParams(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch ImageKit auth params:", err);
      }
    };
    fetchAuth();
  }, []);

  // ✅ Image upload to ImageKit
  const handleUpload = () =>
    new Promise((resolve, reject) => {
      if (!file || !authParams) return resolve("");

      const imagekit = new ImageKit({
        publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
      });

      imagekit.upload(
        {
          file,
          fileName: `post_${Date.now()}`,
          token: authParams.token,
          expire: authParams.expire,
          signature: authParams.signature,
          tags: ["post"],
        },
        (err, result) => {
          if (err) {
            console.error("❌ Upload error:", err);
            return reject(err);
          }
          resolve(result.url); // ✅ Get the URL
        }
      );
    });

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle post submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      onPostCreated(false); // ❌ validation failed
      return;
    }

    try {
      setUploading(true);
      setProgress(20);

      let imageUrl = "";
      if (file) {
        setProgress(40);
        imageUrl = await handleUpload(); // ✅ Wait for ImageKit
        setProgress(70);
      }

      // ✅ sanitize external_link
      let safeLink = externalLink?.trim();
      if (
        safeLink &&
        !safeLink.startsWith("http://") &&
        !safeLink.startsWith("https://")
      ) {
        safeLink = "";
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        external_link: safeLink || "",
        image_url: imageUrl || "",
      };

      if (category.trim()) {
        payload.category = category.trim();
      }

      console.log("📦 Payload:", payload);

      await apiClient.post("/posts/", payload);

      setProgress(100);

      // ✅ Notify parent success
      onPostCreated(true);
      onClose();
    } catch (err) {
      console.error("❌ Post creation failed:", err.response?.data || err.message);

      // ❌ Notify parent failure
      onPostCreated(false);
      onClose();
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-neutral-900 text-white rounded-xl w-full max-w-2xl shadow-lg flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.25 }}
          >
            {/* Scrollable Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto comment-scroll">
              <h2 className="text-xl font-bold mb-4">Create Post</h2>

              {/* Title */}
              <input
                type="text"
                placeholder="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full mb-3 px-3 py-2 rounded bg-neutral-800 ${
                  errors.title ? "border border-red-500 animate-shake" : ""
                }`}
              />

              {/* Description */}
              <textarea
                placeholder="Description *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full mb-3 px-3 py-2 rounded bg-neutral-800 h-24 ${
                  errors.description
                    ? "border border-red-500 animate-shake"
                    : ""
                }`}
              />

              {/* External Link */}
              <input
                type="url"
                placeholder="External link (optional)"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className="w-full mb-3 px-3 py-2 rounded bg-neutral-800"
              />

              {/* Category */}
              <input
                type="text"
                placeholder="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mb-3 px-3 py-2 rounded bg-neutral-800"
              />

              {/* File Picker */}
              <label className="w-full flex flex-col items-center justify-center p-6 mb-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition">
                <span className="text-gray-400">📷 Click to select an image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {/* Preview */}
              {file && (
                <div className="mb-4">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Progress bar */}
              {uploading && (
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                  <motion.div
                    className="bg-purple-500 h-2.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 p-4 border-t border-neutral-800 bg-neutral-900 rounded-b-xl">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostDialog;
