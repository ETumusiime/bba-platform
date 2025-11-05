// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Mock login API route for testing authentication flow
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    // 🧠 For testing — accept any email/password combination
    const token = jwt.sign(
      {
        email,
        role: "parent",
        firstName: email.split("@")[0],
      },
      "mock_secret_key",
      { expiresIn: "2h" }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("❌ Mock login error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
