"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

/* -------------------------------------------------------------------------- */
/* ✅ Inner Component Wrapped by Suspense                                     */
/* -------------------------------------------------------------------------- */
function ParentLoginContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 🧠 Handle Parent Login                                                     */
  /* -------------------------------------------------------------------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:5000";

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error || "Login failed, check your credentials");
      }

      // ✅ Store the parent token both in localStorage and cookies
      localStorage.setItem("bba_parent_token", data.token);
      document.cookie = `bba_parent_token=${data.token}; path=/; max-age=7200; SameSite=Lax;`;

      console.log(
        "🧩 Saved parent token snippet:",
        data.token.slice(0, 30) + "..." + data.token.slice(-30)
      );

      toast.success("✅ Login successful!");

      const next = params.get("next") || "/dashboard";
      router.replace(next);
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "❌ Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🎨 Render Login Page                                                      */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Parent Login
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* ✅ Export Main Page Wrapped in Suspense                                    */
/* -------------------------------------------------------------------------- */
export default function ParentLoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <ParentLoginContent />
    </Suspense>
  );
}
