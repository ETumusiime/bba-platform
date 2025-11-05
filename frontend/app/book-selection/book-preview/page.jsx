"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BookPreview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addBook } = useCart();

  const category = searchParams.get("category");
  const year = searchParams.get("year");
  const subject = searchParams.get("subject");

  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* 🔍 Fetch Book Details Based on Selection */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (category && year && subject) {
      const fetchBook = async () => {
        try {
          const url = `${API}/api/books/preview?category=${encodeURIComponent(
            category
          )}&year=${encodeURIComponent(year)}&subject=${encodeURIComponent(
            subject
          )}`;

          console.log("📡 Fetching:", url);
          const response = await fetch(url);
          if (!response.ok) throw new Error("Book not found");

          const data = await response.json();
          console.log("✅ Received Book Data:", data);
          setBook(data);
        } catch (error) {
          console.error("❌ Fetch error:", error.message);
          toast.error("Book not found");
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [category, year, subject]);

  /* -------------------------------------------------------------------------- */
  /* 🛒 Add to Cart */
  /* -------------------------------------------------------------------------- */
  const handleAddToCart = () => {
    if (!book) return;
    addBook({
      isbn: book.isbn,
      title: book.title,
      price: book.price || book.price_ugx || 0,
      cover_url:
        book.image_url?.startsWith("http")
          ? book.image_url
          : `${API}${book.image_url || ""}`,
    });
    toast.success("✅ Added to cart");
  };

  /* -------------------------------------------------------------------------- */
  /* 🧭 UI States */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading book details...
      </div>
    );

  if (!book || Object.keys(book).length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p>No book found.</p>
        <button
          onClick={() => router.push("/book-selection")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to Selection
        </button>
      </div>
    );

  /* -------------------------------------------------------------------------- */
  /* 🎨 UI Rendering (Flicker-Free, Responsive) */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-5xl w-full bg-white shadow-xl rounded-xl p-6 md:p-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
        {/* ✅ Fixed Image (No Flicker) */}
        <div className="w-60 h-80 flex items-center justify-center border rounded-lg bg-white flex-shrink-0">
          <Image
            src={
              book.image_url?.startsWith("http")
                ? book.image_url
                : `${API}${book.image_url || ""}`
            }
            alt={book.title || "Book cover"}
            width={200}
            height={260}
            unoptimized
            className="object-contain rounded-md"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-book.png";
            }}
          />
        </div>

        {/* 📘 Book Info */}
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {book.title}
            </h1>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Subject:</span> {book.subject}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Category:</span>{" "}
              {book.category_name || book.category}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Level:</span>{" "}
              {book.year || book.grade_year}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Edition:</span>{" "}
              {book.edition || "—"}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Publisher:</span>{" "}
              {book.publisher || "N/A"}
            </p>
            {book.price && (
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Price:</span>{" "}
                UGX {Number(book.price).toLocaleString()}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              ISBN: <span className="font-mono">{book.isbn}</span>
            </p>
          </div>

          {/* 🛒 Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={() => router.push("/book-selection")}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
