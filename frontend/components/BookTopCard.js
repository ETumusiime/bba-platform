"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookTopCard({ book, showOverview = true }) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("bba_cart") || "[]");
    if (!cart.some((b) => b.isbn === book.isbn)) {
      cart.push(book);
      localStorage.setItem("bba_cart", JSON.stringify(cart));
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBack = () => router.back();

  return (
    <div className="flex flex-col items-center px-6 py-10">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/3 flex items-center justify-center bg-gray-50 p-6">
          <img
            src={book.image_path || "/placeholder.png"}
            alt={book.title}
            className="object-contain h-72 w-auto"
          />
        </div>

        <div className="md:w-2/3 p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{book.title}</h1>
            <p className="text-gray-600 mt-1">📘 {book.subject}</p>
            <p className="text-gray-600">📅 {book.year}</p>
            <p className="text-gray-600">🏫 {book.category}</p>
            <p className="text-gray-600 mt-1">Edition: {book.edition || "Latest"}</p>
            <p className="text-gray-600">ISBN: {book.isbn}</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              className={`px-6 py-3 text-white rounded-md font-medium transition ${
                added
                  ? "bg-green-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {added ? "✅ Added to Cart" : "Add to Cart"}
            </button>

            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              ⬅ Back to Selection
            </button>
          </div>
        </div>
      </div>

      {showOverview && (
        <div className="max-w-5xl w-full mt-10 px-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed">{book.overview}</p>
        </div>
      )}
    </div>
  );
}
