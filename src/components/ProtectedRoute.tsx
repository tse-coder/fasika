import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";
import { useEffect } from "react";
import { setAuthToken } from "@/api/http";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token, checkAuth } = useAuth();

  useEffect(() => {
    // Ensure token is set in axios headers
    if (token) {
      setAuthToken(token);
      checkAuth();
    }
  }, [token, checkAuth]);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
