"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCart } from "../../../context/CartContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BookDetailsPage() {
  const { isbn } = useParams();
  const router = useRouter();
  const { addBook } = useCart(); // ✅ from CartContext
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`${API}/api/books/${isbn}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Book not found");
        setBook(data);
        toast.success("✅ Book details loaded");
      } catch (err) {
        console.error("❌ Error fetching book:", err);
        toast.error("Book not found");
      } finally {
        setLoading(false);
      }
    }
    if (isbn) fetchBook();
  }, [isbn]);

  const handleAddToCart = () => {
    if (!book) return;
    // ✅ normalize fields expected by CartContext.addBook
    addBook({
      isbn: book.isbn,
      title: book.title,
      price: Number(book.price_ugx || book.price || 0),
      image_url: book.image_url, // CartContext resolves final cover url
      cover_url: book.cover_url, // (either is fine; provider normalizes)
    });
    toast.success("✅ Added to cart");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading book details...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <p>Book not found.</p>
        <button
          onClick={() => router.push("/book-selection")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Back to Selection
        </button>
      </div>
    );
  }

  const coverSrc =
    book.image_url?.startsWith?.("http")
      ? book.image_url
      : `${API}${book.image_url || ""}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-white shadow-xl rounded-xl p-6 md:p-10 flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="w-[280px] h-[360px] flex items-center justify-center border rounded-lg bg-white">
            {/* NOTE: Next/Image doesn't allow directly mutating src in onError.
               If the source fails, fall back by rendering a plain <img>. */}
            <Image
              src={coverSrc || "/placeholder-book.png"}
              alt={book.title || "Book cover"}
              width={250}
              height={350}
              unoptimized
              className="object-contain rounded-md"
            />
          </div>
        </div>

        <div className="flex flex-col justify-start flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{book.title}</h1>

          <p className="text-gray-600 mb-1">
            <span className="font-semibold">Subject:</span> {book.subject || "—"}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-semibold">Category:</span>{" "}
            {book.category_name || book.category || "—"}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-semibold">Level:</span> {book.grade_year || "—"}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-semibold">Edition:</span> {book.edition || "—"}
          </p>

          {book.price_ugx && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Price:</span>{" "}
              UGX {Number(book.price_ugx).toLocaleString()}
            </p>
          )}

          <p className="text-gray-500 text-sm mt-2">
            ISBN: <span className="font-mono">{book.isbn}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Add to Cart
            </button>

            {typeof window !== "undefined" &&
              window.location.search.includes("from=navigation") && (
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    const category = url.searchParams.get("category");
                    const year = url.searchParams.get("year");
                    window.location.replace(
                      `/books?category=${category}&year=${year}`
                    );
                  }}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  ← Subjects
                </button>
              )}

            <button
              onClick={() => router.push("/book-selection")}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Select Books
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
