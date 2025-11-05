"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Authenticating...");

    try {
      const res = await axios.post(`${API}/api/admin/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);
      toast.dismiss(toastId);
      toast.success("✅ Login successful!");
      router.push("/admin/books-management");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("❌ Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
          BBA Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@bba.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700 transition duration-300"
            } text-white font-semibold py-2.5 rounded-lg`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Bethel Bridge Academy • Admin Access Only
        </p>
      </div>
    </div>
  );
}
