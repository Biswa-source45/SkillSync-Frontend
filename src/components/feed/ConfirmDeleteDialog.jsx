/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

export default function ConfirmDeleteDialog({ open, onClose, onConfirm }) {
  if (!open) return null;

  const handleDelete = async () => {
    await onConfirm(); // parent handles delete + closing
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm border border-neutral-700 text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Delete Post?</h3>
        <p className="text-sm text-neutral-400 mb-4">
          This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
