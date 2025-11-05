"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRouteWrapper({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please log in to access the admin dashboard");
        router.replace("/admin/login");
        return;
      }

      try {
        // ✅ Decode token and verify expiry
        const decoded = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminEmail");
          router.replace("/admin/login");
          return;
        }

        // ✅ Token valid → allow access
        setIsChecking(false);
      } catch (err) {
        console.error("Token check failed:", err);
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Verifying session…
      </div>
    );
  }

  return children;
}
