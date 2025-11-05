"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaSyncAlt,
  FaTrashAlt,
  FaEdit,
  FaSearch,
  FaArrowLeft,
  FaSignOutAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function ViewBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* -------------------------------------------------------------------------- */
  /* 🧩 Fetch All Books */
  /* -------------------------------------------------------------------------- */
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/books");
      const data = await res.json();
      const bookArray =
        Array.isArray(data)
          ? data
          : data.results || data.data || data.books || data.rows || [];
      setBooks(bookArray);
    } catch (err) {
      toast.error("❌ Failed to load books: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🗑️ Delete Book */
  /* -------------------------------------------------------------------------- */
  const handleDelete = async (isbn) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/books/${isbn}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("🗑️ Book deleted successfully!");
      fetchBooks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔐 Logout */
  /* -------------------------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("👋 Logged out successfully");
    router.replace("/admin/login");
  };

  /* -------------------------------------------------------------------------- */
  /* 🔍 Search Filter */
  /* -------------------------------------------------------------------------- */
  const filteredBooks = Array.isArray(books)
    ? books.filter((b) =>
        [
          b.title,
          b.author,
          b.edition,
          b.isbn,
          b.subject,
          b.category,
          b.grade_year,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : [];

  /* -------------------------------------------------------------------------- */
  /* 🧱 RENDER */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          {/* LEFT: PAGE TITLE */}
          <h1 className="text-3xl font-bold text-blue-700 mb-4 sm:mb-0">
            📚 View Uploaded Books
          </h1>

          {/* RIGHT: BUTTONS */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <button
              onClick={() => router.push("/admin/books-management")}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition"
            >
              <FaArrowLeft className="text-gray-600" /> Back to Book Management
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* SEARCH + REFRESH BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="relative w-full sm:w-1/2">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, ISBN, author, edition, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          <button
            onClick={fetchBooks}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="text-center text-gray-500">Loading books...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-center text-gray-500">No books found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-blue-100 text-blue-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 text-left">Cover</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Author</th>
                  <th className="p-3 text-left">Edition</th>
                  <th className="p-3 text-left">ISBN</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Year</th>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-left">Date Published</th>
                  <th className="p-3 text-left">Price (UGX)</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book, index) => (
                  <tr
                    key={index}
                    className={`border-t hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 w-[100px]">
                      {book.cover_url ? (
                        <img
                          src={`http://localhost:5000/uploads/${book.cover_url}`}
                          alt={book.title}
                          className="w-[80px] h-auto object-contain rounded-md shadow"
                        />
                      ) : (
                        <div className="w-[80px] h-[100px] bg-gray-100 flex items-center justify-center rounded text-gray-400 text-xs mx-auto">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-gray-800">
                      {book.title}
                    </td>
                    <td className="p-3">{book.author || "-"}</td>
                    <td className="p-3">{book.edition || "-"}</td>
                    <td className="p-3">{book.isbn || "-"}</td>
                    <td className="p-3">{book.category}</td>
                    <td className="p-3">{book.grade_year || "-"}</td>
                    <td className="p-3">{book.subject || "-"}</td>
                    <td className="p-3">
                      {book.published_date
                        ? new Date(book.published_date).toLocaleDateString(
                            "en-GB",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                    <td className="p-3 font-semibold text-gray-700">
                      {book.price_ugx
                        ? `UGX ${book.price_ugx.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toast("✏️ Edit feature coming soon")}
                          className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1.5 rounded-md hover:bg-yellow-500 transition"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book.isbn)}
                          className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition"
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
