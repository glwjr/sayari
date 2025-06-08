"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface UseAuthGuardOptions {
  requiredRole?: string;
  redirectTo?: string;
  enabled?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { requiredRole, redirectTo = "/auth/login", enabled = true } = options;

  const { isAuthenticated, user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!enabled || loading) return;

    if (!isAuthenticated) {
      setShouldRedirect(true);
      setIsAuthorized(false);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      setShouldRedirect(true);
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(true);
    setShouldRedirect(false);
  }, [isAuthenticated, user, loading, requiredRole, enabled]);

  useEffect(() => {
    if (shouldRedirect && !loading) {
      const targetRedirect =
        requiredRole && isAuthenticated
          ? "/" // Role mismatch - redirect to home
          : redirectTo; // Not authenticated - redirect to login

      redirect(targetRedirect);
    }
  }, [shouldRedirect, loading, redirectTo, requiredRole, isAuthenticated]);

  return {
    isAuthenticated,
    user,
    loading,
    isAuthorized: isAuthorized && !shouldRedirect,
    shouldRedirect,
  };
}
