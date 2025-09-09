/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import ImageKit from "imagekit-javascript";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../services/apiClient";

const EditProfileDialog = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    bio: user.bio || "",
    gender: user.gender || "",
    role: user.role || "",
    profile_photo: user.profile_photo || "",
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [authParams, setAuthParams] = useState(null);

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

  const handleUpload = () =>
    new Promise((resolve, reject) => {
      if (!file || !authParams) return reject("Missing file or auth params");

      const imagekit = new ImageKit({
        publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
      });

      imagekit.upload(
        {
          file,
          fileName: `profile_${user.username}`,
          token: authParams.token,
          expire: authParams.expire,
          signature: authParams.signature,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.url);
        }
      );
    });

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let imageUrl = formData.profile_photo;

      if (file) {
        imageUrl = await handleUpload();
      }

      const updatedData = { ...formData, profile_photo: imageUrl };

      await apiClient.patch("/accounts/profile/", updatedData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("❌ Profile update failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
        <motion.div
          className="bg-neutral-900 text-white p-6 rounded-xl w-full max-w-md shadow-lg"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
        >
          <h2 className="text-lg font-semibold mb-4">Complete Your Profile</h2>

          {/* Avatar Preview */}
          <div className="flex justify-center mb-4">
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                className="w-24 h-24 rounded-full border-2 object-cover"
              />
            ) : formData.profile_photo ? (
              <img
                src={formData.profile_photo}
                className="w-24 h-24 rounded-full border-2 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
                {user.username[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* File Picker */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full mb-4"
          />

          {/* Profile Fields */}
          {["full_name", "bio", "gender", "role"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.replace("_", " ")}
              value={formData[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 rounded bg-neutral-800"
            />
          ))}

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            >
              {uploading ? "Updating..." : "Update"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileDialog;
