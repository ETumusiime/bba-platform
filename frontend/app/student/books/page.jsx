"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function StudentBooksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);

  const API =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  /* ------------------------------------------------------------------------ */
  /* 🔐 STEP 1 — Check login + load books                                      */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("bba_student_token")
        : null;

    if (!token) {
      toast.error("Please log in again");
      router.replace("/student/login?next=/student/books");
      return;
    }

    async function loadBooks() {
      try {
        const res = await fetch(`${API}/api/student/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || "Failed to load books");
        }

        setBooks(json.data || []);
      } catch (err) {
        toast.error(err.message || "Could not load books");
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, [API, router]);

  /* ------------------------------------------------------------------------ */
  /* 📖 STEP 2 — Open the Cambridge/Mallory/Planet Book View                   */
  /* ------------------------------------------------------------------------ */
  function openBook(book) {
    if (!book.providerLink) {
      toast.error("Book not ready yet. Try again later.");
      return;
    }
    window.open(book.providerLink, "_blank", "noopener,noreferrer");
  }

  /* ------------------------------------------------------------------------ */
  /* 🎨 STEP 3 — UI Rendering                                                  */
  /* ------------------------------------------------------------------------ */
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-indigo-700">
            My Book Resources
          </h1>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
          >
            ⬅ Back to Dashboard
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 text-sm text-gray-600 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
          Your books will appear automatically once your parent&apos;s payment is
          confirmed and the school links your digital licenses.
        </div>

        {/* Books */}
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading books…</p>
        ) : books.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            <p className="mb-2">
              You do not have any digital books yet.
            </p>
            <p className="text-sm text-gray-500">
              If you expected to see books, contact your parent or support.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {books.map((b) => (
              <div
                key={b.id}
                className="border rounded-xl p-4 bg-gradient-to-br from-white to-indigo-50 flex flex-col justify-between"
              >
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">{b.isbn}</div>
                  <h2 className="font-semibold text-indigo-800 text-sm">
                    {b.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Provider: {b.provider || "Digital Reader"}
                  </p>

                  {b.expiresAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expires:{" "}
                      {new Date(b.expiresAt).toLocaleDateString("en-GB")}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => openBook(b)}
                  className="mt-2 w-full rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 font-medium"
                >
                  Open Book
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Future Manual Input Section */}
        <div className="mt-8 border-t pt-4 text-xs text-gray-500">
          Manual access code input will be added for special cases.
        </div>
      </div>
    </main>
  );
}
