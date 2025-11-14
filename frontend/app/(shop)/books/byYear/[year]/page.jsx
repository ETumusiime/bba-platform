"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function YearSubjectsPage() {
  const { year } = useParams();
  const router = useRouter();

  const [decodedYear, setDecodedYear] = useState("");

  useEffect(() => {
    if (year) setDecodedYear(decodeURIComponent(year));
  }, [year]);

  const subjectsByYear = {
    "Year 1": ["English", "Mathematics", "Science"],
    "Year 2": ["English", "Mathematics", "Science"],
    "Year 3": ["English", "Mathematics", "Science"],
    "Year 4": ["English", "Mathematics", "Science"],
    "Year 5": ["English", "Mathematics", "Science"],
    "Year 6": ["English", "Mathematics", "Science"],
    "Year 7": ["English", "Mathematics", "Biology", "Chemistry", "Physics"],
    "Year 8": ["English", "Mathematics", "Biology", "Chemistry", "Physics"],
    "Year 9": ["English", "Mathematics", "Biology", "Chemistry", "Physics"],
    "Year 10": [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Computer Science",
      "Enterprise",
    ],
    "Year 11": [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Computer Science",
      "Enterprise",
      "Global Perspectives & Research",
    ],
    "Year 12": ["Economics", "Sociology", "Geography", "ICT"],
    "Year 13": ["Economics", "Sociology", "Geography", "ICT"],
  };

  const subjects = subjectsByYear[decodedYear] || [];

  return (
    <main className="page-transition min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 relative">
        {/* 🔹 Header */}
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          {decodedYear} — Choose Subject
        </h1>

        {/* 🔹 Subjects */}
        {subjects.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
            {subjects.map((subject) => (
              <Link
                key={subject}
                href={`/books/byYear/${decodedYear}/${encodeURIComponent(subject)}`}
                className="px-6 py-3 bg-white shadow-sm hover:shadow-lg rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 text-green-700 transition-all text-center"
              >
                {subject}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-6">
            No subjects found for {decodedYear}.
          </p>
        )}

        {/* 🔹 Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push("/book-selection")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Years
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
