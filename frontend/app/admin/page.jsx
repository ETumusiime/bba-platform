"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token && token.length > 20) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-blue-700">
      Redirecting…
    </div>
  );
}
