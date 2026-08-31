
import {
  Navigate,
  useLocation
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({
  children,
  adminOnly = false
}) => {
  const {
    loading,
    isAuthenticated,
    isAdmin
  } = useAuth();

  const location =
    useLocation();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname
        }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
