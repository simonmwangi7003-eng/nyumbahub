import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullPageSpinner } from "./ui";

export default function ProtectedRoute({ children, admin = false }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const loc = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: loc.pathname + loc.search }}
        replace
      />
    );
  // Only admin pages need to wait for the real profile (the role must be confirmed)
  if (admin && (!profile || profile._temp)) return <FullPageSpinner />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
