"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch(`${API}/api/books`);
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  const startIndex = (page - 1) * booksPerPage;
  const displayedBooks = books.slice(startIndex, startIndex + booksPerPage);
  const totalPages = Math.ceil(books.length / booksPerPage);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar title="BBA Book Catalogue" />

      <section className="flex-1 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-blue-900 mb-10">
            Browse Cambridge Coursebooks & Workbooks
          </h1>

          {loading ? (
            <p className="text-center text-gray-500">Loading books…</p>
          ) : books.length === 0 ? (
            <p className="text-center text-gray-500">No books found.</p>
          ) : (
            <>
              {/* 🔹 Book Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {displayedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center p-4"
                  >
                    <img
                      src={book.cover_url || "/placeholder.jpg"}
                      alt={book.title}
                      className="w-40 h-56 object-cover rounded mb-3 border border-gray-300"
                    />

                    <div className="text-center w-full">
                      <h2 className="font-semibold text-blue-800 text-lg truncate">
                        {book.title || "Untitled Book"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Author: {book.author || "—"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Edition: {book.edition || "—"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ISBN: {book.isbn}
                      </p>
                      <p className="text-green-700 font-semibold mt-2">
                        {book.price_ugx > 0
                          ? `UGX ${Number(book.price_ugx).toLocaleString()}`
                          : "Price TBD"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🔹 Pagination */}
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-6 py-2 rounded-md font-medium ${
                    page === 1
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-800 text-white hover:bg-blue-700"
                  }`}
                >
                  ← Prev
                </button>

                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`px-6 py-2 rounded-md font-medium ${
                    page === totalPages
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-800 text-white hover:bg-blue-700"
                  }`}
                >
                  Next →
                </button>
              </div>
            </>
          )}

          {/* 🔹 Back to Dashboard */}
          <div className="mt-16 text-center">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 shadow-md transition-all"
            >
              <span className="text-lg">🏠</span>
              <span className="font-medium">Back to Dashboard</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
