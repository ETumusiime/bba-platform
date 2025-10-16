"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BookDetailPage() {
  const { isbn } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`${API}/api/books?isbn=${isbn}`);
        const data = await res.json();
        if (data && data.length > 0) setBook(data[0]);
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isbn) fetchBook();
  }, [isbn]);

  if (loading) return <div style={{ padding: 40 }}>⏳ Loading book...</div>;
  if (!book) return <div style={{ padding: 40 }}>❌ Book not found</div>;

  // ✅ Build cover image URL from backend
  const coverSrc = `${API}/covers_highres/${(book.isbn || "").replace(/[\s-]/g, "")}.jpg`;
  console.log("🖼️ Image URL:", coverSrc);

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <div style={{ display: "flex", gap: "30px" }}>
        <img
          src={coverSrc}
          alt={book.title}
          style={{
            width: "280px",
            borderRadius: "6px",
            objectFit: "contain",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
          onError={(e) => {
            e.currentTarget.src = "/placeholder-cover.png";
          }}
        />

        <div>
          <h1 style={{ marginBottom: "10px" }}>{book.title}</h1>
          <p><b>Edition:</b> {book.edition || "—"}</p>
          <p><b>Author:</b> {book.author || "—"}</p>
          <p><b>Published:</b> {book.published_date || "—"}</p>
          <p><b>Format:</b> {book.format || "—"}</p>
          <p><b>ISBN:</b> {book.isbn || "—"}</p>
        </div>
      </div>

      <hr style={{ margin: "30px 0" }} />

      {book.overview && (
        <>
          <h2>Overview</h2>
          <p>{book.overview}</p>
        </>
      )}

      {book.features && (
        <>
          <h2>Features</h2>
          <ul>
            {book.features.split("\n").map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {book.contents && (
        <>
          <h2>Contents</h2>
          <ul>
            {book.contents.split("\n").map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      )}

      {book.accessibility && (
        <>
          <h2>Accessibility</h2>
          <p>{book.accessibility}</p>
        </>
      )}
    </div>
  );
}
