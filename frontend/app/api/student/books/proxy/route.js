// app/api/student/books/proxy/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "dev-secret";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ticket = searchParams.get("ticket");
    if (!ticket) return NextResponse.json({ error: "Missing ticket" }, { status: 400 });

    const payload = jwt.verify(ticket, SECRET); // throws if expired/tampered
    const url = payload.url;

    // Best-effort framing safety (real DRM still depends on provider)
    const res = NextResponse.redirect(url, 302);
    res.headers.set("Content-Security-Policy", "frame-ancestors 'self';");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Invalid or expired ticket" }, { status: 401 });
  }
}
