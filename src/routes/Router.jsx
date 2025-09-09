import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import App, { ProtectedRoute } from "../App";
import FeedPage from "../pages/FeedPage"; // create later
import ProfilePage from "../pages/ProfilePage";
import ForgotPassword from "../pages/ForgotPassword";

const Router = createBrowserRouter([
  { path: "/",
    element: <App />
  },
  { path: "/login",
    element: <Login />
  },
  { path: "/register",
    element: <Register />
  },
  { path: "/feed",
    element: (
      <ProtectedRoute>
        <FeedPage/>
      </ProtectedRoute>
    )
  },
  {
    path : "/profile/:username" ,
    element:<ProfilePage />
  },
  {
    path : "/forgot-password",
    element:<ForgotPassword/>
  }
]);

export default Router;