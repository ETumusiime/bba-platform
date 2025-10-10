"use client";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", form);
      setUser(res.data.user);
      setMessage("✅ Login successful!");
      console.log(res.data);
    } catch (error) {
      setMessage("❌ Login failed: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Login (BBA Platform)</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 mb-3 w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-2 mb-3 w-full"
          required
        />
        <button type="submit" className="bg-green-600 text-white py-2 px-4 w-full rounded hover:bg-green-700">
          Login
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
        {user && (
          <div className="mt-4 p-3 border rounded text-center">
            <p>Welcome, <strong>{user.name}</strong>!</p>
            <p>Role: {user.role}</p>
          </div>
        )}
      </form>
    </div>
  );
}
