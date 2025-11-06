// middleware.js
import { NextResponse } from "next/server";

// ✅ Define protected route groups
const PARENT_ROUTES  = ["/dashboard", "/orders", "/account"];
const CHILD_ROUTES   = ["/child", "/child/books"];
const STUDENT_ROUTES = ["/student", "/student/dashboard", "/student/books"];

// ✅ Helper function to match route prefixes
function matches(pathname, bases) {
  return bases.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`)
  );
}

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // ✅ Log route to verify middleware is running
  console.log("🧭 Middleware running on:", pathname);

  // ✅ Skip all auth checks during local development
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    console.log("⚙️  Development mode → auth checks bypassed");
    return NextResponse.next();
  }

  // ✅ 1. Allow all public & internal routes
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/login") ||          // parent login/register
    pathname.startsWith("/auth") ||           // legacy auth route
    pathname.startsWith("/child/login") ||    // child login
    pathname.startsWith("/student/login") ||  // student login
    pathname.startsWith("/admin/login")       // admin login
  ) {
    return NextResponse.next();
  }

  // ✅ 2. Read auth cookies for all roles
  const parentToken =
    req.cookies.get("bba_parent_token")?.value ||
    req.cookies.get("bba_token")?.value || // fallback for older code
    null;
  const childToken = req.cookies.get("bba_child_token")?.value || null;
  const studentToken = req.cookies.get("bba_child_token")?.value || null; // 👈 student uses same cookie name for now

  // ✅ 3. Protect Parent area routes
  if (matches(pathname, PARENT_ROUTES)) {
    if (!parentToken) {
      console.log("🚫 No parent token found → redirecting to /login");
      url.pathname = "/login";
      url.searchParams.set("next", pathname + (req.nextUrl.search ?? ""));
      return NextResponse.redirect(url);
    }
  }

  // ✅ 4. Protect Child area routes
  if (matches(pathname, CHILD_ROUTES)) {
    if (!childToken) {
      console.log("🚫 No child token found → redirecting to /child/login");
      url.pathname = "/child/login";
      url.searchParams.set("next", pathname + (req.nextUrl.search ?? ""));
      return NextResponse.redirect(url);
    }
  }

  // ✅ 5. Protect Student area routes
  if (matches(pathname, STUDENT_ROUTES)) {
    if (!studentToken) {
      console.log("🚫 No student token found → redirecting to /student/login");
      url.pathname = "/student/login";
      url.searchParams.set("next", pathname + (req.nextUrl.search ?? ""));
      return NextResponse.redirect(url);
    }
  }

  // ✅ 6. Otherwise, allow request to proceed
  return NextResponse.next();
}

// ✅ 7. Apply middleware to all non-public routes
export const config = {
  matcher: ["/((?!_next|api|favicon.ico|public).*)"],
};
