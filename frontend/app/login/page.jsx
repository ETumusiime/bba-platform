"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Demo login simulation
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bbaGray">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border-t-4 border-bbaBlue">
        <h1 className="text-2xl font-bold text-bbaBlue mb-6 text-center">
          BBA Parent Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bbaBlue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bbaBlue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bbaBlue text-white py-2 rounded-md hover:bg-blue-700 transition-all"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          © {new Date().getFullYear()} Bethel Bridge Academy
        </p>
      </div>
    </div>
  );
}
