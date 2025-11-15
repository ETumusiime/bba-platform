"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminAssignmentsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");

  const API =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  /* -------------------------------------------------------------------------- */
  /* 🔐 Auth Check (Admin Only)                                                */
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
  /* 📦 Load Assigned Books                                                    */
  /* -------------------------------------------------------------------------- */
  async function loadAssignments() {
    try {
      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(`${API}/api/admin/student-books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      setAssignments(json.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🔍 Filter Assignments                                                     */
  /* -------------------------------------------------------------------------- */
  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.studentName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.title?.toLowerCase().includes(q) ||
      a.isbn?.toLowerCase().includes(q)
    );
  });

  /* -------------------------------------------------------------------------- */
  /* 🎨 UI Rendering                                                            */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">
            Assigned Student Books
          </h1>

          <button
            onClick={() => router.push("/admin/assign-code")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
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
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-500"
                  >
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-500"
                  >
                    No assigned books found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3">{a.studentName}</td>
                    <td className="p-3 text-gray-600">{a.email}</td>
                    <td className="p-3">{a.title}</td>
                    <td className="p-3">{a.isbn}</td>
                    <td className="p-3 font-mono text-xs">
                      {a.accessCodeRaw}
                    </td>
                    <td className="p-3 text-blue-600 underline cursor-pointer">
                      <a
                        href={a.providerLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </td>
                    <td className="p-3">
                      {a.expiresAt
                        ? new Date(a.expiresAt).toLocaleDateString(
                            "en-GB"
                          )
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
