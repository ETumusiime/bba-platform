"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar title="BBA Book Catalogue" />

      <section className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
            Browse Cambridge Coursebooks & Workbooks
          </h1>

          {loading ? (
            <p className="text-center text-gray-500">Loading books…</p>
          ) : books.length === 0 ? (
            <p className="text-center text-gray-500">No books found.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center text-center"
                >
                  <img
                    src={book.cover_url || "/placeholder.jpg"}
                    alt={book.title}
                    className="w-40 h-56 object-cover rounded mb-3"
                  />
                  <h2 className="font-semibold text-blue-800 text-lg">{book.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">ISBN: {book.isbn}</p>
                  {book.price_ugx ? (
                    <p className="mt-2 font-medium text-green-700">
                      UGX {Number(book.price_ugx).toLocaleString()}
                    </p>
                  ) : (
                    <p className="mt-2 text-gray-400">Price TBD</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <a
              href="/dashboard"
              className="inline-block px-6 py-2 rounded-lg bg-blue-800 text-white hover:bg-blue-700 transition"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
