"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function SelectBooksPage() {
  const router = useRouter();
  const [navData, setNavData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    async function fetchNavigationData() {
      try {
        const res = await fetch(`${API}/api/books/navigation-data`);
        const data = await res.json();
        setNavData(data);
      } catch (err) {
        console.error("❌ Failed to load navigation data:", err);
      }
    }
    fetchNavigationData();
  }, []);

  const handleSubjectSelect = (subject) => {
    const category = encodeURIComponent(selectedCategory);
    const year = encodeURIComponent(selectedYear);
    const subj = encodeURIComponent(subject);
    router.push(`/books/preview?category=${category}&year=${year}&subject=${subj}`);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        📘 Select Your Cambridge Books
      </h1>

      {/* Category Dropdown */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Choose a Cambridge Category:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedYear("");
            setSelectedSubject("");
          }}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option value="">-- Select Category --</option>
          {Object.keys(navData).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Year Dropdown */}
      {selectedCategory && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Choose Year:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedSubject("");
            }}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">-- Select Year --</option>
            {Object.keys(navData[selectedCategory] || {}).map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      )}

      {/* Subject Dropdown */}
      {selectedYear && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Choose Subject:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              handleSubjectSelect(e.target.value);
            }}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">-- Select Subject --</option>
            {(navData[selectedCategory]?.[selectedYear] || []).map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
