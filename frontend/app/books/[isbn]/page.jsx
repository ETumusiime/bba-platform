"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "../../../context/CartContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BookDetailsPage() {
  const { isbn } = useParams();
  const searchParams = useSearchParams();
  const { addBook } = useCart();

  const year = searchParams.get("year") || "";
  const subject = searchParams.get("subject") || "";

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`${API}/api/books/${isbn}`);
        if (!res.ok) throw new Error("Book not found");
        const data = await res.json();
        setBook(data);
        toast.success("✅ Book details loaded");
      } catch {
        toast.error("Book not found");
      } finally {
        setLoading(false);
      }
    }
    if (isbn) fetchBook();
  }, [isbn]);

  const handleAddToCart = () => {
    if (!book) return;
    addBook({
      isbn: book.isbn,
      title: book.title,
      price: Number(book.price_ugx || book.price || 0),
      image_url: book.image_url,
    });
    toast.success("✅ Added to cart");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Loading book details…
      </div>
    );

  if (!book)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <p>Book not found.</p>
        <Link
          href="/book-selection"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Back to Selection
        </Link>
      </div>
    );

  const coverSrc =
    book.image_url?.startsWith?.("http")
      ? book.image_url
      : `${API}${book.image_url || ""}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-white shadow-xl rounded-xl p-6 md:p-10 flex flex-col md:flex-row gap-10">
        {/* 🖼️ Book Cover */}
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="w-[280px] h-[360px] flex items-center justify-center border rounded-lg bg-white">
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

        {/* 📘 Book Details */}
        <div className="flex flex-col justify-start flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{book.title}</h1>
          <p className="text-gray-600 mb-1">
            <span className="font-semibold">Subject:</span> {book.subject || "—"}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-semibold">Level:</span> {book.grade_year || "—"}
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

          {/* 🧭 Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            {/* ✅ Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Add to Cart
            </button>

            {/* ✅ Conditional Navigation */}
            {year && subject ? (
              <>
                {/* Back to Subjects (returns to year view) */}
                <Link
                  href={`/books/byYear/${encodeURIComponent(year)}`}
                  className="px-4 py-2 rounded-md border hover:bg-gray-100 transition"
                >
                  ← Subjects
                </Link>

                {/* Back to main Select Books */}
                <Link
                  href="/book-selection"
                  className="px-4 py-2 rounded-md border hover:bg-gray-100 transition"
                >
                  Select Books
                </Link>
              </>
            ) : (
              <>
                {/* Only Select Books when user came from search */}
                <Link
                  href="/book-selection"
                  className="px-4 py-2 rounded-md border hover:bg-gray-100 transition"
                >
                  Select Books
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
