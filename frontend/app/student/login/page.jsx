"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function StudentLoginContent() {
  const router = useRouter();
  const params = useSearchParams();

  const prefilledEmail = params.get("email") || "";

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Use env or fallback
  const API =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  /* -------------------------------------------------------------------------- */
  /* 🚀 Handle Login                                                            */
  /* -------------------------------------------------------------------------- */
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Login failed");
        setLoading(false);
        return;
      }

      const token = json.data.token;
      const student = json.data.student;

      // Save student token + data
      localStorage.setItem("bba_student_token", token);
      localStorage.setItem("bba_student_name", student.fullName);
      localStorage.setItem("bba_student_info", JSON.stringify(student));

      toast.success(`Welcome, ${student.fullName}!`);

      router.replace("/student/dashboard");
    } catch (err) {
      console.error("❌ Login Error:", err);
      toast.error("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🎨 UI Rendering                                                            */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          Student Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              className="w-full border rounded-lg px-4 py-2"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              className="w-full border rounded-lg px-4 py-2"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading
                ? "bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wrapper: keeps compatibility with Next.js Suspense routing                  */
/* -------------------------------------------------------------------------- */
export default function StudentLoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <StudentLoginContent />
    </Suspense>
  );
}
