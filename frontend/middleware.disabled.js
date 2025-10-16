import { NextResponse } from "next/server";

/**
 * Global Middleware – Protects specific routes
 * Automatically redirects unauthenticated users to /login
 */
export function middleware(req) {
  const token = req.cookies.get("parentToken") || null;
  const url = req.nextUrl.clone();

  // Define routes that require authentication
  const protectedPaths = ["/dashboard", "/orders", "/profile"];
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // If route is protected but user has no token
  if (isProtected && !token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Configure which routes this middleware applies to
 */
export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*", "/profile/:path*"],
};
