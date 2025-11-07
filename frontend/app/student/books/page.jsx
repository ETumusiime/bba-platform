"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function StudentBooksPage() {
  const router = useRouter();
  const [accessCode, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState([]);
  const [page, setPage] = useState(0); // current page
  const perPage = 3; // 3 cards per view

  /* -------------------------------------------------------------------------- */
  /* 📚 Fetch Redeemed Books                                                    */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const token =
      localStorage.getItem("bba_child_token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("bba_child_token="))
        ?.split("=")[1];

    if (!token) {
      toast.error("Please login again", { duration: 2000 });
      router.replace("/student/login?next=/student/books");
      return;
    }

    fetch("http://localhost:5000/api/student/books", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLibrary(Array.isArray(data) ? data : []))
      .catch(() => setLibrary([]));
  }, [router]);

  /* -------------------------------------------------------------------------- */
  /* 🔑 Handle Redeem Flow                                                      */
  /* -------------------------------------------------------------------------- */
  async function handleRedeem(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const code = accessCode.trim().toUpperCase();
      if (!code) throw new Error("Please enter an access code");

      const validateRes = await fetch(
        `http://localhost:5000/api/cambridge/validate?code=${code}`
      );
      const validation = await validateRes.json();

      if (!validateRes.ok || !validation.valid)
        throw new Error(validation.error || "Invalid or expired access code");

      const { subject, providerUrl } = validation;

      const token =
        localStorage.getItem("bba_child_token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("bba_child_token="))
          ?.split("=")[1];

      if (!token) throw new Error("Not logged in");

      const redeemRes = await fetch(
        "http://localhost:5000/api/student/books/redeem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ accessCode: code, subject, providerUrl }),
        }
      );

      const redeemData = await redeemRes.json();

      if (!redeemRes.ok || !redeemData.success)
        throw new Error(redeemData.error || "Failed to redeem book");

      const { assignment } = redeemData;

      toast.success(`✅ ${subject} unlocked`, { duration: 2000 });
      setLibrary((prev) => [assignment, ...prev]);
      setCode(""); // clear input
      router.replace(
        `/student/books/viewer?ticket=${assignment.accessCode}&title=${assignment.subject}`
      );
    } catch (err) {
      toast.error(err.message || "Failed to unlock", { duration: 2500 });
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* ❌ Delete Redeemed Book (Backend + UI)                                    */
  /* -------------------------------------------------------------------------- */
  const handleDelete = async (id) => {
    try {
      const token =
        localStorage.getItem("bba_child_token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("bba_child_token="))
          ?.split("=")[1];

      if (!token) throw new Error("Not logged in");

      const res = await fetch(`http://localhost:5000/api/student/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setLibrary((prev) => prev.filter((b) => b.id !== id));
      toast.success("Book removed from your library", { duration: 1500 });
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error(err.message || "Error deleting book", { duration: 2000 });
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 📄 Pagination logic                                                        */
  /* -------------------------------------------------------------------------- */
  const totalPages = Math.ceil(library.length / perPage);
  const start = page * perPage;
  const currentBooks = library.slice(start, start + perPage);

  /* -------------------------------------------------------------------------- */
  /* 🧱 Page Layout                                                             */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <Toaster position="top-center" />

      {/* 🔑 Redeem Section */}
      <div className="w-full max-w-xl bg-white rounded-xl shadow p-6 mb-8">
        <h1 className="text-2xl font-bold text-indigo-800 mb-5">
          Redeem a New Book
        </h1>
        <form onSubmit={handleRedeem} className="flex flex-col gap-4">
          <input
            className="border rounded p-3"
            placeholder="Enter Access Code (e.g. CUP-ENG-001)"
            value={accessCode}
            onChange={(e) => setCode(e.target.value)}
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
        <p className="text-sm text-gray-500 mt-3 text-center">
          Input an access code here to access and view your book.
        </p>
      </div>

      {/* 📚 Library Section */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-indigo-800 mb-4">
          My Redeemed Books
        </h2>

        {library.length === 0 ? (
          <p className="text-gray-500 text-center">
            You haven’t redeemed any books yet.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentBooks.map((book) => (
                <div
                  key={book.id}
                  className="relative border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                >
                  {/* ❌ Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(book.id);
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                    title="Remove book"
                  >
                    ×
                  </button>

                  {/* 📖 Book card */}
                  <div
                    onClick={() =>
                      router.push(
                        `/student/books/viewer?ticket=${book.accessCode}&title=${book.subject}`
                      )
                    }
                  >
                    <h3 className="text-indigo-700 font-semibold">
                      {book.subject}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Code: {book.accessCode}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(book.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-6">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className={`px-4 py-2 rounded ${
                    page === 0
                      ? "bg-gray-200 text-gray-400"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  ← Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className={`px-4 py-2 rounded ${
                    page >= totalPages - 1
                      ? "bg-gray-200 text-gray-400"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
