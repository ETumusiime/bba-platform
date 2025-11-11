"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function SubjectBooksPage() {
  const router = useRouter();
  const { year, subject } = useParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch(`${API}/api/books/search?q=${encodeURIComponent(subject)}`);
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        const results = data.results || [];

        // ✅ Auto-redirect if exactly one book found
        if (results.length === 1) {
          const book = results[0];
          setRedirecting(true);

          // Add short delay to show loading spinner before navigation
          setTimeout(() => {
            router.push(
              `/books/${book.isbn}?year=${encodeURIComponent(year)}&subject=${encodeURIComponent(subject)}`
            );
          }, 100);
          return;
        }

        // Otherwise show list (rare case with multiple books)
        setBooks(results);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("No books found for this subject.");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [subject, year, router]);

  // ✅ Smooth loading spinner
  if (loading || redirecting)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
          <p>{redirecting ? "Opening book details..." : `Loading ${subject} books...`}</p>
        </div>
      </main>
    );

  // ✅ Fallback for errors or empty results
  if (error)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-xl font-semibold text-indigo-700 mb-2">
          {decodeURIComponent(year)} — {decodeURIComponent(subject)}
        </h1>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => router.push(`/book-selection?restore=${encodeURIComponent(year)}`)}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to Subjects
        </button>
      </main>
    );

  // ✅ Only shows if multiple books exist
  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 p-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">
            {decodeURIComponent(year)} — {decodeURIComponent(subject)}
          </h1>
          <button
            onClick={() => router.push(`/book-selection?restore=${encodeURIComponent(year)}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Subjects
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book) => {
            const coverSrc = book.image_url?.startsWith?.("http")
              ? book.image_url
              : `${API}${book.image_url || ""}`;

            return (
              <div
                key={book.isbn}
                className="border rounded-lg shadow-sm bg-white hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <div className="w-full h-64 flex items-center justify-center bg-white border-b">
                  <Image
                    src={coverSrc || "/placeholder-book.png"}
                    alt={book.title}
                    width={200}
                    height={250}
                    unoptimized
                    className="object-contain"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-md font-semibold text-gray-800 mb-1">
                      {book.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-1">
                      Subject: {book.subject}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      Level: {book.grade_year || book.level}
                    </p>
                    <p className="text-green-700 font-medium mb-3">
                      UGX {Number(book.price_ugx || book.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/books/${book.isbn}?year=${encodeURIComponent(year)}&subject=${encodeURIComponent(subject)}`
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition mt-auto"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
