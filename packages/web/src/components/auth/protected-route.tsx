"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { LoadingProgress } from "../loading-progress";

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

  // Show loading while checking authentication
  if (loading) {
    return <LoadingProgress />;
  }

  // Don't render anything while redirecting
  if (shouldRedirect || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
