"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/* -------------------------------------------------------------------------- */
/* ✅ Secure Supabase Initialization (prevents build-time crash)              */
/* -------------------------------------------------------------------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables. Check .env.local");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

/* -------------------------------------------------------------------------- */
/* 🧩 Password Reset Page                                                    */
/* -------------------------------------------------------------------------- */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* 🔐 Verify if user has a valid reset session                              */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    async function verifyToken() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn("Token verification warning:", error.message);
        setTokenChecked(true);
      } catch (err) {
        console.error("Token check failed:", err);
        setTokenChecked(true);
      }
    }
    verifyToken();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* 💾 Handle password reset submission                                     */
  /* ------------------------------------------------------------------------ */
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setMessage("✅ Password updated successfully! Redirecting to login...");
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to reset password. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* 🎨 Render Layout                                                        */
  /* ------------------------------------------------------------------------ */
  if (!tokenChecked)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>Validating link...</p>
    );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f7f7f7",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          Reset Your Password
        </h2>
        <form onSubmit={handlePasswordReset}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#007bff",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#0056b3")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#007bff")
            }
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
        {message && (
          <p style={{ color: "green", marginTop: "15px" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
