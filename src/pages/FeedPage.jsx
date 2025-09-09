// FeedPage.jsx
import { useRef, useState } from "react";
import LeftSidebar from "../components/feed/LeftSidebar";
import CenterFeed from "../components/feed/CenterContent/CenterFeed";
import FeedNavbar from "../components/feed/FeedNavbar";
import ChatPanel from "../components/feed/RightSidebar.jsx/ChatPanel";
import { FiCpu } from "react-icons/fi";

const FeedPage = () => {
  const feedRef = useRef(null);
  const [chatOpen, setChatOpen] = useState(false);

  const refreshFeed = () => {
    if (feedRef.current) {
      feedRef.current.refreshFeed();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <div className="sticky top-0 z-50">
        <FeedNavbar onPostCreated={refreshFeed} />
      </div>

      <div className="w-full flex">
        {/* Left Sidebar */}
        <div className="hidden md:block w-1/4 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-hidden">
          <LeftSidebar />
        </div>

        {/* Center Feed */}
        <div className="w-full md:w-1/2">
          <CenterFeed ref={feedRef} />
        </div>

        {/* Right Sidebar - Full Height Chat (desktop only) */}
        <div className="hidden md:block w-1/4 sticky top-16 self-start h-[calc(100vh-4rem)]">
          <ChatPanel />
        </div>
      </div>

      {/* Mobile Floating Button */}
      <button
  onClick={() => setChatOpen(true)}
  className="fixed bottom-6 right-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full w-14 h-14 shadow-xl flex items-center justify-center border border-neutral-600 md:hidden z-50 transition-colors duration-200"
>
  <FiCpu size={26} className="text-purple-400" />
</button>

      {/* Mobile Chat Overlay */}
      <ChatPanel mobileOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default FeedPage;