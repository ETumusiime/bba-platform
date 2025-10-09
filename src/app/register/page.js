"use client";
import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "PARENT" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/register", form);
      setMessage("✅ Registered successfully!");
      console.log(res.data);
    } catch (error) {
      setMessage("❌ Registration failed: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Register (BBA Platform)</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="border p-2 mb-3 w-full"
          required
        />
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
        <select name="role" onChange={handleChange} className="border p-2 mb-3 w-full">
          <option value="PARENT">Parent</option>
          <option value="STUDENT">Student</option>
          <option value="SUPPLIER">Supplier</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 w-full rounded hover:bg-blue-700">
          Register
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}
