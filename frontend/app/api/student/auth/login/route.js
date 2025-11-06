// app/api/student/auth/login/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "dev-secret";

export async function POST(req) {
  const { username, password } = await req.json();

  // MVP mock: accept anything non-empty
  if (!username || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign({ sub: `child_${username}`, role: "child", username }, SECRET, { expiresIn: "7d" });
  return NextResponse.json({ token });
}
