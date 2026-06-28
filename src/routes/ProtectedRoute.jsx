import { Navigate } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}
