// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Generate a short-lived mock JWT for testing
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Basic mock validation
    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // For testing, any email/password combo works
    const token = jwt.sign(
      { email, role: "parent", firstName: email.split("@")[0] },
      "mock_secret_key",
      { expiresIn: "2h" }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
