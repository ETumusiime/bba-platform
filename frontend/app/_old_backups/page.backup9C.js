"use client";
import { useState } from "react";
import { categories } from "./categoriesData";
import CategoryButtons from "./components/CategoryButtons";
import YearButtons from "./components/YearButtons";
import SubjectButtons from "./components/SubjectButtons";

export default function BooksPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // ISBN search (placeholder for Phase 9B hookup)
  const [isbnQuery, setIsbnQuery] = useState("");

  const resetToYears = () => {
    setSelectedSubject(null);
  };

  const resetToCategories = () => {
    setSelectedYear(null);
    setSelectedSubject(null);
    setSelectedCategory(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        📚 Browse Cambridge Coursebooks & Workbooks
      </h1>

      {/* Top search (ISBN) — will connect in Phase 9B */}
      <div className="max-w-xl mx-auto mt-4">
        <label htmlFor="isbnSearch" className="sr-only">
          Search by ISBN
        </label>
        <input
          id="isbnSearch"
          type="text"
          value={isbnQuery}
          onChange={(e) => setIsbnQuery(e.target.value)}
          placeholder="Enter ISBN (e.g., 9781108...)"
          className="w-full border rounded px-4 py-2 outline-none focus:ring focus:ring-blue-200"
        />
        <p className="text-xs text-gray-500 mt-1 text-center">
          Quick lookup — live search & results coming in Phase 9B.
        </p>
      </div>

      {/* STEP 1: Category Selection */}
      {!selectedCategory && (
        <>
          <p className="text-center text-gray-600 mt-4">
            Start by choosing a Cambridge Pathway.
          </p>
          <CategoryButtons
            categories={categories}
            onSelect={(cat) => setSelectedCategory(cat)}
          />
        </>
      )}

      {/* STEP 2: Year Selection */}
      {selectedCategory && !selectedYear && (
        <>
          <h2 className="text-xl font-semibold mt-8 text-center">
            {selectedCategory.name}
          </h2>
          <YearButtons
            years={selectedCategory.years}
            onSelectYear={(year) => setSelectedYear(year)}
          />
          <div className="text-center mt-4">
            <button
              onClick={resetToCategories}
              className="text-sm text-gray-500 underline"
            >
              ← Back to Categories
            </button>
          </div>
        </>
      )}

      {/* STEP 3: Subject Selection */}
      {selectedCategory && selectedYear && !selectedSubject && (
        <>
          <h2 className="text-xl font-semibold mt-8 text-center">
            {selectedYear} – Select a Subject
          </h2>
          <SubjectButtons
            subjects={selectedCategory.subjects}
            onSelectSubject={(subj) => setSelectedSubject(subj)}
          />
          <div className="text-center mt-4">
            <button
              onClick={() => setSelectedYear(null)}
              className="text-sm text-gray-500 underline"
            >
              ← Back to Years
            </button>
          </div>
        </>
      )}

      {/* STEP 4: Placeholder for Book List (Phase 9C) */}
      {selectedSubject && (
        <div className="text-center mt-10">
          <h2 className="text-2xl font-semibold mb-2">
            {selectedSubject} – Available Books
          </h2>
          <p className="text-gray-600">
            (Book cards will appear here in Phase 9C)
          </p>
          <button
            onClick={resetToYears}
            className="mt-4 text-sm text-gray-500 underline"
          >
            ← Back to Subjects
          </button>
        </div>
      )}
    </div>
  );
}
