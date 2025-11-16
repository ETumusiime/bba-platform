// middleware.js
import { NextResponse } from "next/server";

// ✅ Define protected route groups (unchanged)
const PARENT_ROUTES  = ["/dashboard", "/orders", "/account"];
const CHILD_ROUTES   = ["/child", "/child/books"];
const STUDENT_ROUTES = ["/student", "/student/dashboard", "/student/books"];

// ✅ Helper: match route prefixes
function matches(pathname, bases) {
  return bases.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`)
  );
}

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  console.log("🧭 Middleware running on:", pathname);

  const isDev = process.env.NODE_ENV !== "production";

  // --------------------------------------------------
  // 🚀 EXCLUDE ALL ADMIN ROUTES FROM THIS MIDDLEWARE
  // (Admin login + admin dashboard + all children)
  // --------------------------------------------------
  if (pathname.startsWith("/admin")) {
    // We allow layout.jsx to handle admin auth
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 🚀 In dev mode, skip all auth checks for parent/child/student
  // --------------------------------------------------
  if (isDev) {
    console.log("⚙️  Development mode → auth checks bypassed");
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 🎯 Public routes (never protected)
  // --------------------------------------------------
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/login") ||          // parent login/register
    pathname.startsWith("/auth") ||           // legacy auth route
    pathname.startsWith("/child/login") ||    // child login
    pathname.startsWith("/student/login")     // student login
  ) {
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 🍃 Read cookies
  // --------------------------------------------------
  const parentToken =
    req.cookies.get("bba_parent_token")?.value ||
    req.cookies.get("bba_token")?.value ||
    null;

  const childToken = req.cookies.get("bba_child_token")?.value || null;
  const studentToken = req.cookies.get("bba_child_token")?.value || null;

  // --------------------------------------------------
  // 👨‍👩‍👧 Parent protected routes
  // --------------------------------------------------
  if (matches(pathname, PARENT_ROUTES)) {
    if (!parentToken) {
      url.pathname = "/login";
      url.searchParams.set("next", pathname + (req.nextUrl.search ?? ""));
      return NextResponse.redirect(url);
    }
  }

  // --------------------------------------------------
  // 🧒 Child protected routes
  // --------------------------------------------------
  if (matches(pathname, CHILD_ROUTES)) {
    if (!childToken) {
      url.pathname = "/child/login";
      url.searchParams.set("next", pathname + (req.nextUrl.search ?? ""));
      return NextResponse.redirect(url);
    }
  }

  // --------------------------------------------------
  // 🎓 Student protected routes
  // --------------------------------------------------
  if (matches(pathname, STUDENT_ROUTES)) {
    if (!studentToken) {
      url.pathname = "/student/login";
      url.searchParams.set("next", pathname + (req.nextUrl.search ?? ""));
      return NextResponse.redirect(url);
    }
  }

  // --------------------------------------------------
  // Allow all other routes
  // --------------------------------------------------
  return NextResponse.next();
}

// --------------------------------------------------
// Matcher: apply middleware to all routes EXCEPT admin
// --------------------------------------------------
export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|public|admin).*)",
  ],
};
