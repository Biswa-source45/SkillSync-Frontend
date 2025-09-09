import React from "react";
import ChatBot from "./ChatBot";

export default function ChatPanel({ mobileOpen, onClose }) {
  // Mobile overlay version
  if (mobileOpen !== undefined) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
            <div className="absolute inset-4 bg-neutral-900 rounded-xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white z-10"
              >
                ✕
              </button>
              <ChatBot inline={true} />
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar version - full height
  return (
    <div className="h-full w-full">
      <ChatBot inline={true} />
    </div>
  );
}