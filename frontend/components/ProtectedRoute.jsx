"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * ✅ ProtectedRoute — final stable version
 * Guarantees correct token usage and stops cross redirects.
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // delay check until after hydration
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const isAdmin = pathname.startsWith("/admin");
    const tokenKey = isAdmin ? "adminToken" : "parentToken";
    const redirectPath = isAdmin ? "/admin/login" : "/login";
    const token = localStorage.getItem(tokenKey);

    // ✅ Prevent redirect if adminToken exists even briefly
    if (token && token.length > 20) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      if (!isAdmin || pathname === "/admin") {
        router.replace(redirectPath);
      }
    }
  }, [pathname, ready, router]);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f7fb",
          color: "#12417A",
        }}
      >
        Loading session…
      </div>
    );
  }

  if (!authorized) return null;

  return children;
}
