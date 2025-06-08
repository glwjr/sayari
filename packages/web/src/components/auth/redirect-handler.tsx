"use client";

import { useEffect } from "react";
import { usePathname, redirect } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const PROTECTED_ROUTES = ["/profile", "/settings", "/admin"];

// List of routes that should redirect authenticated users
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export default function RedirectHandler() {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (isProtectedRoute && !isAuthenticated) {
      redirect("/auth/login");
    } else if (isAuthRoute && isAuthenticated) {
      redirect("/");
    }
  }, [isAuthenticated, loading, pathname]);

  return null;
}
