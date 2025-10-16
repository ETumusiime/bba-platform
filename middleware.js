import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();

  console.log("🧩 middleware.js triggered on path:", url.pathname);

  // Redirect all /admin paths to /login for now
  if (url.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
