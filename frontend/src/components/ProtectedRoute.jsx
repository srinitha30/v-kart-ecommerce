import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


export default function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location =
    useLocation();


  // =====================================================
  // AUTH CHECK LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f6f3",
          fontFamily:
            "DM Sans, sans-serif",
        }}
      >
        Loading VKART...
      </div>
    );
  }


  // =====================================================
  // NOT AUTHENTICATED
  // =====================================================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }


  // =====================================================
  // AUTHENTICATED
  // =====================================================

  return children;
}