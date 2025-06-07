import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/"];

  // Admin-only routes
  const adminRoutes = ["/admin"];

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard"];

  // Check if the route is public
  if (publicRoutes.includes(pathname)) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (
      token &&
      (pathname === "/auth/login" || pathname === "/auth/register")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check if user is trying to access protected routes without token
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // For admin routes, we'll need to decode the JWT to check the role
  // This is a simplified check - in production, you might want to validate the token server-side
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // Add additional role checking logic here if needed
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
