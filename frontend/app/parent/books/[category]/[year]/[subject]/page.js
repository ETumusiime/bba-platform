"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/* -------------------------------------------------------------------------- */
/* ✅ ParentBookList — Dynamic Book Display by Category / Year / Subject */
/* -------------------------------------------------------------------------- */
export default function ParentBookList({ params }) {
  // Decode URL params directly (Next.js 15 automatically unwraps Promise)
  const category = decodeURIComponent(params?.category || "");
  const year = decodeURIComponent(params?.year || "");
  const subject = decodeURIComponent(params?.subject || "");

  return (
    <ParentBookListClient
      category={category}
      year={year}
      subject={subject}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* ✅ Client-side Component — Fetch + Render Books */
/* -------------------------------------------------------------------------- */
function ParentBookListClient({ category, year, subject }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API}/api/books/category/${encodeURIComponent(category)}/year/${encodeURIComponent(
            year
          )}/subject/${encodeURIComponent(subject)}`
        );
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [category, year, subject]);

  /* ---------------------------------------------------------------------- */
  /* ✅ Conditional UI states */
  /* ---------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading books…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  // If no matching books found
  if (books.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <h2 className="text-xl font-semibold mb-2">
          {category} — {year} — {subject}
        </h2>
        <p className="text-gray-500">
          There are currently no books available for this selection.
        </p>
      </div>
    );

  /* ---------------------------------------------------------------------- */
  /* ✅ Render Books */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-indigo-700">
        {category} — {year} — {subject}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <div
            key={book.isbn}
            className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition"
          >
            <div className="flex justify-center items-center mb-3">
              <Image
                src={`${API}${book.cover_url}`}
                alt={book.title}
                width={180}
                height={250}
                className="object-contain rounded-md"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {book.title}
            </h2>
            <p className="text-sm text-gray-600">Edition: {book.edition}</p>
            <p className="text-sm text-gray-600">Subject: {book.subject}</p>
            <p className="text-sm text-gray-600">Year: {book.year}</p>
            <p className="text-sm text-gray-600 mb-2">
              Category: {book.category}
            </p>

            <button
              onClick={() =>
                (window.location.href = `/parent/books/${book.isbn}`)
              }
              className="mt-2 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              Select Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
