"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../lib/auth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState(null);

  // Wait for client hydration first
  useEffect(() => {
    setHydrated(true);
  }, []);

  // After hydration, check for token
  useEffect(() => {
    if (!hydrated) return;
    const t = getToken();
    console.log("ProtectedRoute → storedToken:", t);
    if (t && t.length > 20) {
      setToken(t);
    } else {
      router.replace("/login");
    }
  }, [hydrated, router]);

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#f4f7fb",
          color: "#12417A",
          fontFamily: "'Merriweather', Georgia, serif",
        }}
      >
        <div>Loading session…</div>
      </div>
    );
  }

  if (!token) return null;

  return children;
}
