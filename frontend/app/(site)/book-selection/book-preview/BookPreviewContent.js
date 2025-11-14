"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookPreviewContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Example: getting book ID or ISBN from the URL query
  const bookId = params.get("bookId") || params.get("isbn");

  useEffect(() => {
    if (!bookId) return;

    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error("❌ Error loading book preview:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [bookId]);

  if (loading) return <p className="text-gray-600">⏳ Loading book preview...</p>;
  if (!book) return <p className="text-red-500">⚠️ Book not found</p>;

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-6">
      <h2 className="text-2xl font-semibold mb-4">{book.title}</h2>
      <p className="mb-4 text-gray-700">
        <strong>Subject:</strong> {book.subject}
      </p>
      <p className="mb-4 text-gray-700">
        <strong>ISBN:</strong> {book.isbn}
      </p>
      <button
        onClick={() => router.push("/book-selection")}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md"
      >
        ← Back to Selection
      </button>
    </main>
  );
}
