"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ProtectedRoute – ensures only authenticated parents can access certain pages.
 * Redirects to /login if token is missing or invalid.
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("parentToken");

    // If no token, send user to login
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      // Decode token payload
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp ? new Date(payload.exp * 1000) : null;

      // Check expiry
      if (exp && exp < new Date()) {
        localStorage.removeItem("parentToken");
        router.replace("/login");
        return;
      }

      setAuthorized(true);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("parentToken");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Checking access...
      </div>
    );
  }

  return authorized ? children : null;
}
