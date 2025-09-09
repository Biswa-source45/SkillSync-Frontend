/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store.js";
import Router from "./routes/Router.jsx";

import {
  refreshToken as refreshTokenAPI,
  getCurrentUser,
} from "./services/authAPI";
import {
  setAuth,
  setCurrentUser,
  clearAuth,
  startLoading,
  stopLoading,
} from "./redux/slices/authSlice";
import GlobalLoader from "./components/GlobalLoader";
import { Toaster } from "sonner";   // ✅ import Toaster

// ========================================
// Bootstrap wrapper to restore session
// ========================================
function Bootstrap({ children }) {
  const dispatch = useDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      dispatch(startLoading());
      try {
        // Try silent refresh using refresh token cookie
        const { data } = await refreshTokenAPI();

        if (data?.access) {
          // ✅ Mark as authenticated
          dispatch(setAuth());

          // ✅ Fetch user profile
          const profileRes = await getCurrentUser();
          dispatch(setCurrentUser(profileRes.data));
        } else {
          dispatch(clearAuth());
        }
      } catch (err) {
        console.warn("Silent refresh failed:", err);
        dispatch(clearAuth());
      } finally {
        dispatch(stopLoading());
        if (mounted) setBootstrapped(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (!bootstrapped) return <GlobalLoader />; // prevent flicker

  return children;
}

// ========================================
// Render App
// ========================================
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Bootstrap>
        <RouterProvider router={Router} />
        {/* ✅ Global toast provider */}
        <Toaster richColors position="top-right" />
      </Bootstrap>
    </Provider>
  </StrictMode>
);
