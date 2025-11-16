"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminAssignmentsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  /* -------------------------------------------------------------------------- */
  /* 🔐 ADMIN AUTH CHECK                                                        */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("bba_admin_token");
    if (!token) {
      router.replace("/admin/login?next=/admin/assignments");
      return;
    }

    loadAssignments();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 📦 LOAD ALL STUDENT → BOOK ASSIGNMENTS                                     */
  /* -------------------------------------------------------------------------- */
  async function loadAssignments() {
    try {
      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(`${API}/api/admin/student-books`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      setAssignments(json.data || []);
    } catch (err) {
      console.error("Assignment load error:", err);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🔍 FILTER ASSIGNMENTS (based on actual backend fields)                     */
  /* -------------------------------------------------------------------------- */
  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();

    return (
      a.student.fullName.toLowerCase().includes(q) ||
      a.student.email.toLowerCase().includes(q) ||
      a.book.title.toLowerCase().includes(q) ||
      a.book.isbn.toLowerCase().includes(q)
    );
  });

  /* -------------------------------------------------------------------------- */
  /* 🎨 RENDER UI                                                                */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            Assigned Student Books
          </h1>

          <button
            onClick={() => router.push("/admin/assign-code")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            ➕ Assign New Code
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by student, book, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-4 py-2 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Book Title</th>
                <th className="p-3 text-left">ISBN</th>
                <th className="p-3 text-left">Access Code</th>
                <th className="p-3 text-left">Provider Link</th>
                <th className="p-3 text-left">Expires</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500 dark:text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No assigned books found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3">{a.student.fullName}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {a.student.email}
                    </td>
                    <td className="p-3">{a.book.title}</td>
                    <td className="p-3">{a.book.isbn}</td>
                    <td className="p-3 font-mono text-xs">{a.accessCode}</td>
                    <td className="p-3 text-blue-600 underline cursor-pointer dark:text-blue-400">
                      {a.providerLink ? (
                        <a href={a.providerLink} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      {a.expiresAt
                        ? new Date(a.expiresAt).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
