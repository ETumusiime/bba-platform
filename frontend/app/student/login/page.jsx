"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

function StudentLoginContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Prefill email if passed from parent registration
  useEffect(() => {
    const queryEmail = params.get("email");
    if (queryEmail) setEmail(queryEmail);
  }, [params]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials");
      }

      const { token, child } = data;
      if (!token) throw new Error("Missing token from server");

      localStorage.setItem("bba_child_token", token);
      localStorage.setItem("bba_child_info", JSON.stringify(child));
      document.cookie = `bba_child_token=${token}; path=/; SameSite=Lax;`;

      const name = child?.first_name || "Student";
      toast.success(`✅ Welcome, ${name}!`, { duration: 2000 });

      setTimeout(() => {
        const next = params.get("next") || "/student/dashboard";
        router.replace(next);
      }, 2200);
    } catch (err) {
      console.error("❌ Login Error:", err);
      toast.error(err.message || "❌ Login failed. Check credentials.", {
        duration: 2500,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Student Login
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="border rounded p-3"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="border rounded p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded p-3 transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <StudentLoginContent />
    </Suspense>
  );
}
