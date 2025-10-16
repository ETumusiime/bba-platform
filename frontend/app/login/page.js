"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "../../lib/auth";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Login failed");
      }

      const data = await res.json();
      if (!data?.token) {
        throw new Error("No token in response");
      }

      // 1) Save token
      saveToken(data.token);

      // 2) Confirm success
      setMessage("Login successful! Redirecting…");

      // 3) Redirect (use replace to prevent back-nav to login)
      // Small delay only to let user see the toast text
      console.log("Redirecting now...");
     setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.h1}>Parent Login</h1>

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          value={email || ""}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          value={password || ""}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button style={styles.button} disabled={loading} type="submit">
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {message ? <p style={styles.success}>{message}</p> : null}
        {error ? <p style={styles.error}>{error}</p> : null}
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    background: "#f4f7fb",
    padding: "32px",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "#fff",
    border: "1px solid #e6eef7",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
  },
  h1: {
    margin: 0,
    marginBottom: 16,
    fontFamily: "'Merriweather', Georgia, serif",
    color: "#12417A",
    fontSize: 26,
    lineHeight: "1.25",
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    display: "block",
    color: "#3A4C66",
    fontSize: 13,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d9e6",
    outline: "none",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    marginTop: 8,
    padding: "12px 14px",
    background: "#1E5AA8",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  success: { color: "#157347", marginTop: 10, fontSize: 13 },
  error: { color: "#B42318", marginTop: 10, fontSize: 13 },
};
