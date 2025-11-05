// middleware.js
import { NextResponse } from "next/server";

// ✅ Define protected route groups
const PARENT_ROUTES = ["/dashboard", "/orders", "/account"];
const CHILD_ROUTES  = ["/child", "/child/books"];

// ✅ Simple helper function to match route prefixes
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

  // ✅ 1. Allow public & internal routes to pass through
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/login") ||        // ✅ Parent login/register (updated)
    pathname.startsWith("/child/login")     // ✅ Child login
  ) {
    return NextResponse.next();
  }

  // ✅ 2. Read auth cookies for both roles
  const parentToken =
    req.cookies.get("bba_parent_token")?.value ||
    req.cookies.get("bba_token")?.value || // 👈 fallback for older login code
    null;
  const childToken = req.cookies.get("bba_child_token")?.value || null;

  // ✅ 3. Protect Parent area routes
  if (matches(pathname, PARENT_ROUTES)) {
    if (!parentToken) {
      console.log("🚫 No parent token found → redirecting to /login");
      url.pathname = "/login"; // ✅ updated from /auth/login
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

  // ✅ 5. Otherwise, allow the request
  return NextResponse.next();
}

// ✅ 6. Apply middleware to all non-public routes
export const config = {
  matcher: ["/((?!_next|api|favicon.ico|public).*)"],
};
