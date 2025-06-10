"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { LoadingProgress } from "../common/loading-progress";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/auth/login",
}: ProtectedRouteProps) {
  const { isAuthorized, loading, shouldRedirect } = useAuthGuard({
    requiredRole,
    redirectTo: fallbackPath,
  });

  if (loading) {
    return <LoadingProgress />;
  }

  if (shouldRedirect || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
