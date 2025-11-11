"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function SubjectBooksPage({ params }) {
  const router = useRouter();
  const { year, subject } = params;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API}/api/books?year=${encodeURIComponent(year)}&subject=${encodeURIComponent(subject)}`
        );
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        if (!data || !data.length) {
          setError("No books found for this subject.");
          setBooks([]);
        } else {
          setBooks(data);
          toast.success(`${data.length} books found`);
        }
      } catch (err) {
        console.error("❌ Error loading books:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [year, subject]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading {subject} books…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 text-center">
        <p>{error}</p>
        <Link
          href={`/book-selection?restore=${encodeURIComponent(year)}`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          ← Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6 flex flex-col items-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-6xl border">
        {/* ✅ Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-700 mb-6">
          {year} — {subject}
        </h1>

        {/* ✅ Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {books.map((book) => (
            <div
              key={book.isbn}
              className="border rounded-lg shadow-sm hover:shadow-lg transition p-4 flex flex-col items-center bg-white"
            >
              <div className="w-[200px] h-[260px] mb-4 relative">
                <Image
                  src={
                    book.cover_url?.startsWith("http")
                      ? book.cover_url
                      : `${API}${book.cover_url || ""}`
                  }
                  alt={book.title || "Book cover"}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain rounded-md border"
                  unoptimized
                />
              </div>

              <h2 className="font-semibold text-gray-800 text-center mb-2">
                {book.title}
              </h2>

              <p className="text-sm text-gray-600 mb-2">
                UGX {Number(book.price_ugx || book.price || 0).toLocaleString()}
              </p>

              <Link
                href={`/books/${encodeURIComponent(book.isbn)}?year=${encodeURIComponent(year)}&subject=${encodeURIComponent(subject)}`}
                className="mt-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                View Book
              </Link>
            </div>
          ))}
        </div>

        {/* ✅ Navigation Buttons */}
        <div className="flex justify-between mt-10">
          <Link
            href={`/book-selection?restore=${encodeURIComponent(year)}`}
            className="text-blue-600 hover:underline"
          >
            ← Subjects
          </Link>

          <Link
            href="/book-selection"
            className="text-blue-600 hover:underline"
          >
            Select Books
          </Link>
        </div>
      </div>
    </main>
  );
}
