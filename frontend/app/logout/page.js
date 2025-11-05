"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
      <p>Logging out...</p>
    </main>
  );
}
