// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("bba_token")?.value || null;
  const { pathname } = url;

  // ✅ 1. Skip admin routes entirely
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ✅ 2. Define public (unauthenticated) routes
  const publicPaths = ["/", "/_next", "/favicon.ico"];

  // ✅ 3. If logged in and trying to access the login page ("/"), redirect to dashboard
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ 4. If not logged in and trying to access a protected route (like /dashboard)
  if (!token && !publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.url)); // previously /login
  }

  // ✅ 5. Otherwise, allow request
  return NextResponse.next();
}

// ✅ 6. Middleware config: applies to both /dashboard and /
export const config = {
  matcher: ["/dashboard/:path*", "/"], 
};
