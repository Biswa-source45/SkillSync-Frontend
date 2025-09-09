import { useState, useEffect } from "react";
import { getCurrentUser } from "../../../services/authAPI";
import { Link } from "react-router-dom";

const ProfileCard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    loadUser();
  }, []);

  const avatarLetter = user?.username?.[0]?.toUpperCase() || "U";

  return (
    <div className="dark:bg-zinc-900 shadow-sm rounded-xl p-3 flex flex-col items-center text-center w-full max-w-[250px] mx-auto overflow-hidden">
      {user?.profile_photo ? (
        <img
          src={user.profile_photo}
          alt="Profile"
          className="w-14 h-14 rounded-full object-cover border border-zinc-500"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-purple-400 flex items-center justify-center text-lg font-bold border border-zinc-500">
          {avatarLetter}
        </div>
      )}

      <h2 className="mt-2 text-base font-medium break-all">@{user?.username}</h2>
      {user?.full_name && (
        <p className="text-xs text-zinc-400 break-all">{user.full_name}</p>
      )}

      <p className="text-xs text-zinc-600 mt-1 break-words">
        {user?.bio || "No bio added yet."}
      </p>

      <div className="flex justify-around w-full mt-2 text-xs text-zinc-700 dark:text-zinc-400">
        <span>{user?.gender || "Gender"}</span>
        <span>{user?.role || "Role"}</span>
      </div>

      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 break-all">
        {user?.email}
      </p>

      <Link
        to={`/profile/${user?.username}`}
        className="mt-3 text-xs text-white bg-blue-500 px-3 py-1 rounded-lg hover:bg-blue-600 transition w-full"
      >
        View Profile
      </Link>
    </div>
  );
};

export default ProfileCard;
