"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  // ---------------- Fetch Books ----------------
  const fetchBooks = async (currentPage = page, searchQuery = query) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit });
      if (searchQuery.trim()) params.append("q", searchQuery);

      const res = await fetch(`${API}/api/books?${params.toString()}`);
      const data = await res.json();
      setBooks(data.rows || data);
      setTotal(data.total || 0);
      setPage(currentPage);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Auto Refresh ----------------
  useEffect(() => {
    fetchBooks();
    const interval = setInterval(() => fetchBooks(page, query), 15000);
    return () => clearInterval(interval);
  }, [page]);

  // ---------------- Search ----------------
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks(1, query);
  };

  // ---------------- Re-Sync ----------------
  const handleResync = async () => {
    try {
      setSyncing(true);
      setMessage("🔄 Syncing books with high-res covers...");
      const res = await fetch(`${API}/api/books/resync`, { method: "POST" });
      const data = await res.json();
      setMessage(`✅ Re-Sync Complete — ${data.updated || 0} books updated.`);
      await fetchBooks(1, query);
    } catch (err) {
      console.error("Error during resync:", err);
      setMessage("❌ Error during re-sync. Check console.");
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const goNext = () => page < totalPages && fetchBooks(page + 1, query);
  const goPrev = () => page > 1 && fetchBooks(page - 1, query);

  // ---------------- Render ----------------
  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f8fb", minHeight: "100vh" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          color: "#003b73",
          letterSpacing: "0.5px",
        }}
      >
        📚 Cambridge Coursebooks (High-Res)
      </h2>

      {/* ---- Top Controls ---- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "300px",
              padding: "0.6rem 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#003b73",
              color: "white",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🔍 Search
          </button>
        </form>

        {/* Re-Sync Button */}
        <button
          onClick={handleResync}
          disabled={syncing}
          style={{
            backgroundColor: syncing ? "#aaa" : "#0073cf",
            color: "white",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            cursor: syncing ? "not-allowed" : "pointer",
            fontWeight: 500,
          }}
        >
          {syncing ? "⏳ Syncing..." : "🔄 Re-Sync Books"}
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          style={{
            textAlign: "center",
            backgroundColor: "#e8f4ff",
            border: "1px solid #bcdffb",
            color: "#004c91",
            borderRadius: "6px",
            padding: "0.6rem",
            marginBottom: "1rem",
          }}
        >
          {message}
        </div>
      )}

      {/* ---- Books Grid ---- */}
      {loading ? (
        <div style={{ textAlign: "center" }}>
          <p>Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: "center" }}>
          <p>No books found.</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {books.map((book) => (
              <div
                key={book.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.08)";
                }}
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                    backgroundColor: "#eef2f5",
                  }}
                />
                <div style={{ padding: "1rem" }}>
                  <h4
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "1rem",
                      color: "#002855",
                      lineHeight: "1.3",
                      minHeight: "48px",
                    }}
                  >
                    {book.title || "Untitled Book"}
                  </h4>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#444" }}>
                    <strong>Author:</strong> {book.author || "—"}
                  </p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#444" }}>
                    <strong>Edition:</strong> {book.edition || "—"}
                  </p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#444" }}>
                    <strong>ISBN:</strong> {book.isbn || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ---- Pagination ---- */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
              gap: "1rem",
            }}
          >
            <button
              onClick={goPrev}
              disabled={page === 1}
              style={{
                backgroundColor: "#003b73",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              ◀ Prev
            </button>

            <span style={{ alignSelf: "center", color: "#003b73" }}>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={goNext}
              disabled={page === totalPages}
              style={{
                backgroundColor: "#003b73",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "6px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
