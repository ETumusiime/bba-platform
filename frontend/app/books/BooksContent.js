"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addBook } = useCart();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const category = searchParams.get("category");
  const subject = searchParams.get("subject");
  const year = searchParams.get("year");

  useEffect(() => {
    if (year) localStorage.setItem("lastYear", year);
  }, [year]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!category || !subject) return;

      try {
        const params = new URLSearchParams();
        params.append("category", category);
        if (year) params.append("year", year);
        params.append("subject", subject);

        const url = `${API}/api/books?${params.toString()}`;
        console.log("🛰️ Fetching:", url);

        setLoading(true);
        const res = await fetch(url);
        const data = await res.json();
        console.log("✅ Backend responded:", data);

        if (res.ok && (data.results?.length || data.length)) {
          const list = data.results || data;
          setBooks(list);
          setMessage("");

          // ✅ Detect single-book result and open in new page immediately
          if (Array.isArray(list) && list.length === 1 && list[0]?.isbn) {
            const singleBook = list[0];
            toast.loading("Opening book details...");
            Promise.resolve().then(() => {
              if (typeof window !== "undefined") {
                window.location.assign(
                  `/books/${singleBook.isbn}?from=navigation&category=${encodeURIComponent(
                    category
                  )}&year=${encodeURIComponent(year || "")}&subject=${encodeURIComponent(
                    subject
                  )}`
                );
              }
            });
            return;
          }
        } else {
          setBooks([]);
          setMessage("No books found for your selection.");
        }
      } catch (err) {
        console.error("❌ Error loading books:", err);
        setMessage("Failed to load books. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [category, subject, year, router]);

  const goBackToSubjects = () => {
    const lastYear = year || localStorage.getItem("lastYear");
    if (lastYear) {
      router.push(`/book-selection?restore=${encodeURIComponent(lastYear)}`);
    } else {
      router.push("/book-selection");
    }
  };

  const handleAddToCart = (book) => {
    addBook({
      isbn: book.isbn,
      title: book.title,
      price: book.price_ugx || book.price || 0,
      cover_url:
        book.image_url?.startsWith("http")
          ? book.image_url
          : `${API}${book.image_url || ""}`,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-6">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6 text-center">
        {category || "Books"} {year ? `— ${year}` : ""}{" "}
        {subject ? `— ${subject}` : ""}
      </h2>

      <div className="mb-8">
        <button
          onClick={goBackToSubjects}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md transition"
        >
          ← Back to Selection
        </button>
      </div>

      {loading && <p className="text-gray-600">⏳ Loading books...</p>}
      {!loading && message && <p className="text-gray-500 mb-6">{message}</p>}

      {!loading && books.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="relative h-80">
                <Image
                  src={
                    book.image_url?.startsWith("http")
                      ? book.image_url
                      : `${API}${book.image_url || ""}`
                  }
                  alt={book.title || "Book Cover"}
                  fill
                  unoptimized
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-book.png";
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-blue-900 mb-2 leading-snug">
                  {book.title?.replace(/IGCSET/gi, "IGCSE") || "Untitled Book"}
                </h3>
                <p className="text-gray-700 text-sm mb-1">
                  <strong>Subject:</strong> {book.subject || "—"}
                </p>
                <p className="text-gray-700 text-sm mb-1">
                  <strong>Edition:</strong> {book.edition || "—"}
                </p>
                <p className="text-gray-700 text-sm mb-3">
                  <strong>ISBN:</strong> {book.isbn || "—"}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/books/${book.isbn}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(book)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
