"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

/* -------------------------------------------------------------------------- */
/* CONFIG                                                                     */
/* -------------------------------------------------------------------------- */
const API =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */
export default function AdminAssignCodePage() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [accessCode, setAccessCode] = useState("");
  const [providerLink, setProviderLink] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Load Students + Books                                                    */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    async function load() {
      try {
        const [sRes, bRes] = await Promise.all([
          fetch(`${API}/api/admin/student-books/students`),
          fetch(`${API}/api/admin/student-books/books`),
        ]);

        const sJson = await sRes.json();
        const bJson = await bRes.json();

        if (!sJson.success || !bJson.success)
          throw new Error("Failed to load lists");

        setStudents(sJson.data);
        setBooks(bJson.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Submit Assignment                                                         */
  /* ------------------------------------------------------------------------ */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedStudent || !selectedBook)
      return toast.error("Select both student and book.");

    try {
      const res = await fetch(`${API}/api/admin/student-books/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          bookId: selectedBook.id,
          accessCode,
          providerLink,
          expiresAt: expiresAt || null,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      toast.success("Access code assigned successfully!", {
        duration: 2500,
      });

      setTimeout(() => router.push("/admin/assignments"), 1800);
    } catch (err) {
      toast.error(err.message);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */
  return (
    <main className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">
            Assign Access Code
          </h1>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="px-4 py-2 rounded-md border hover:bg-gray-100"
          >
            ⬅ Back to Dashboard
          </button>
        </div>

        {/* Info */}
        <p className="text-gray-600 text-sm mb-6">
          Choose the student and book, then input the access code and provider
          link sent by Mallory. Once saved, this book will appear in the
          student’s “My Books” page immediately.
        </p>

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Select Student
              </label>
              <select
                value={selectedStudent?.id || ""}
                onChange={(e) =>
                  setSelectedStudent(
                    students.find((s) => s.id === e.target.value)
                  )
                }
                required
                className="w-full border rounded-lg p-3 bg-gray-50"
              >
                <option value="">Choose Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} — {s.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Select Book
              </label>
              <select
                value={selectedBook?.id || ""}
                onChange={(e) =>
                  setSelectedBook(
                    books.find((b) => b.id === e.target.value)
                  )
                }
                required
                className="w-full border rounded-lg p-3 bg-gray-50"
              >
                <option value="">Choose Book</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.isbn}
                  </option>
                ))}
              </select>
            </div>

            {/* Access Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Access Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ENG-1234-2025"
                className="w-full border rounded-lg p-3"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>

            {/* Provider Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Provider Link (from Mallory)
              </label>
              <input
                type="url"
                required
                placeholder="https://www.cambridgego.org/…"
                className="w-full border rounded-lg p-3"
                value={providerLink}
                onChange={(e) => setProviderLink(e.target.value)}
              />
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Expiry Date (optional)
              </label>
              <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
            >
              Assign Access Code
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
