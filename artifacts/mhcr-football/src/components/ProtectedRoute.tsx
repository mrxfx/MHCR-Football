import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/admin" />;
  }

  return <>{children}</>;
}
