import "./App.css";
import Landing from "./pages/Landing";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Toaster } from "sonner";

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  // No authentication check here - just show Landing page
  return (
    <>
      <Landing />
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;