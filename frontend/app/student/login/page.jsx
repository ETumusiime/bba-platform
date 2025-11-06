"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function StudentLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const { token } = await res.json();

      // Store student token (MVP: non-httpOnly cookie for simplicity)
      localStorage.setItem("bba_child_token", token);
      document.cookie = `bba_child_token=${token}; path=/; SameSite=Lax;`;

      toast.success("✅ Welcome!");
      const next = params.get("next") || "/student/dashboard";
      router.replace(next);
    } catch (err) {
      toast.error("❌ Login failed. Check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">Student Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="border rounded p-3"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
          />
          <input
            className="border rounded p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
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
