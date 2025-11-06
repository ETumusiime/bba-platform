"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "Geography",
  "History",
];

export default function StudentBooksPage() {
  const router = useRouter();
  const [subject, setSubject]     = useState("");
  const [accessCode, setCode]     = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleRedeem(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/student/books/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, accessCode }),
      });
      if (!r.ok) {
        const j = await r.json().catch(()=>({}));
        throw new Error(j?.error || "Redeem failed");
      }
      const { viewerUrl, title } = await r.json();
      toast.success(`✅ ${title} unlocked`);
      router.replace(viewerUrl); // e.g. /student/books/viewer?ticket=...
    } catch (err) {
      toast.error(err.message || "Failed to unlock");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-xl bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-indigo-800 mb-5">My Book Resources</h1>
        <form onSubmit={handleRedeem} className="flex flex-col gap-4">
          <select
            className="border rounded p-3"
            value={subject}
            onChange={(e)=>setSubject(e.target.value)}
            required
          >
            <option value="">Select Subject</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            className="border rounded p-3"
            placeholder="Enter Access Code"
            value={accessCode}
            onChange={(e)=>setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded p-3"
          >
            {loading ? "Unlocking…" : "Open Book"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-3">
          Tip: Each purchased book (e.g., Physics, Chemistry) comes with its own access code.
        </p>
      </div>
    </main>
  );
}
