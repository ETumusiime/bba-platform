"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoryMap } from "../../utils/categoryMap";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BookSelection() {
  const router = useRouter();

  const allYears = [
    "Year 1","Year 2","Year 3","Year 4","Year 5","Year 6",
    "Year 7","Year 8","Year 9","Year 10","Year 11","Year 12","Year 13",
  ];

  // Auto-derive Cambridge category from year
  const categoryFromYear = (year) => {
    if (["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"].includes(year))
      return "Primary";
    if (["Year 7","Year 8","Year 9"].includes(year))
      return "Lower Secondary";
    if (["Year 10","Year 11"].includes(year))
      return "Upper Secondary";
    if (["Year 12","Year 13"].includes(year))
      return "Advanced";
    return "Primary";
  };

  const subjectsByYear = {
    "Year 1": ["English","Mathematics","Science"],
    "Year 2": ["English","Mathematics","Science"],
    "Year 3": ["English","Mathematics","Science"],
    "Year 4": ["English","Mathematics","Science"],
    "Year 5": ["English","Mathematics","Science"],
    "Year 6": ["English","Mathematics","Science"],
    "Year 7": ["English","Mathematics","Biology","Chemistry","Physics"],
    "Year 8": ["English","Mathematics","Biology","Chemistry","Physics"],
    "Year 9": ["English","Mathematics","Biology","Chemistry","Physics"],
    "Year 10": ["Mathematics","Physics","Chemistry","Biology","English","Computer Science","Enterprise"],
    "Year 11": ["Mathematics","Physics","Chemistry","Biology","English","Computer Science","Enterprise","Global Perspectives & Research"],
    "Year 12": ["Economics","Sociology","Geography","ICT"],
    "Year 13": ["Economics","Sociology","Geography","ICT"],
  };

  /* -------------------------------------------------------------------------- */
  /* 🎯 STATE */
  /* -------------------------------------------------------------------------- */
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 🧭 If user comes from "Back to Subjects", restore previous year automatically */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restoreYear = params.get("restore");
    if (restoreYear) setSelectedYear(restoreYear);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* ⚙️ HANDLERS */
  /* -------------------------------------------------------------------------- */
  const handleYear = (year) => {
    setSelectedYear(year);
    setSelectedSubject(null);
  };

  const handleSubject = (subject) => {
    const derivedCategory = categoryFromYear(selectedYear);
    const internalCategory = categoryMap[derivedCategory] || derivedCategory;

    router.push(
      `/books?category=${encodeURIComponent(internalCategory)}&year=${encodeURIComponent(
        selectedYear
      )}&subject=${encodeURIComponent(subject)}`
    );
  };

  const resetYear = () => {
    setSelectedYear(null);
    setSelectedSubject(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const mappedQuery = categoryMap[query] || query.replace(/^Cambridge\s+/i, "").trim();
      const res = await fetch(`${API}/api/books/search?q=${encodeURIComponent(mappedQuery)}`);
      if (!res.ok) throw new Error("Book not found");

      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const found = data.results[0];
        window.open(`/books/${found.isbn}`, "_blank");
      } else {
        setError("No results found for that ISBN or keyword.");
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      setError("No results found. Please check your entry and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    router.replace("/login");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  /* -------------------------------------------------------------------------- */
  /* 🖼️ UI RENDERING */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 relative">

        {/* 🔹 TOP BUTTONS */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={goToDashboard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm transition"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* 🧭 MAIN HEADER */}
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          Select Books
        </h1>

        {/* 🔍 SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            placeholder="🔍 Search by title, subject, or ISBN"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="text-center text-red-500 font-medium mb-4">{error}</p>}

        {/* 🧭 YEAR SELECTION */}
        {!selectedYear && (
          <>
            <h2 className="text-lg font-semibold mb-3 text-gray-700 text-center">
              What year is your child in?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
              {allYears.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYear(year)}
                  className="px-6 py-3 text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md hover:shadow-lg rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all text-center font-medium"
                >
                  {year}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 🧭 SUBJECT SELECTION */}
        {selectedYear && !selectedSubject && (
          <>
            <h2 className="text-lg font-semibold mb-3 text-gray-700 text-center">
              {selectedYear} — Choose Subject
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
              {(subjectsByYear[selectedYear] ||
                ["Mathematics", "English", "Science"]).map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubject(subject)}
                  className="px-6 py-3 bg-white shadow-sm hover:shadow-lg rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 text-green-700 transition-all text-center"
                >
                  {subject}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={resetYear}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to Years
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}


