// app/api/student/books/redeem/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "dev-secret";

// Stub: translate subject+code to a provider URL (Mallory/Cambridge GO)
function resolveProviderUrl(subject, accessCode) {
  // TODO: swap with real Mallory integration
  // For MVP, use a sample public PDF or DOC viewer link.
  // Keep per-book granularity assumption:
  // e.g., return `https://provider.example.com/${subject}/?code=${accessCode}`
  return `https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf`; // demo PDF
}

export async function POST(req) {
  try {
    const { subject, accessCode } = await req.json();
    if (!subject || !accessCode) {
      return NextResponse.json({ error: "Missing subject or access code" }, { status: 400 });
    }

    const providerUrl = resolveProviderUrl(subject, accessCode);

    // Create a short-lived viewer ticket (5 minutes) that the proxy will validate
    const ticket = jwt.sign(
      { sub: "viewer", subject, accessCode, url: providerUrl },
      SECRET,
      { expiresIn: "5m" }
    );

    const viewerUrl = `/student/books/viewer?ticket=${encodeURIComponent(ticket)}&title=${encodeURIComponent(subject)}`;
    return NextResponse.json({ viewerUrl, title: `${subject}` });
  } catch (e) {
    return NextResponse.json({ error: "Redeem failed" }, { status: 500 });
  }
}
