"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminAssignAccessCodePage() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [providerLink, setProviderLink] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  /* --------------------------------------------------------------------- */
  /* 🔐 Load Students + Books                                              */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("bba_admin_token");

        if (!token) {
          toast.error("Not authenticated.");
          router.push("/admin/login");
          return;
        }

        const [studentsRes, booksRes] = await Promise.all([
          axios.get(`${API}/api/admin/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/api/admin/books`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStudents(studentsRes.data.students || []);
        setBooks(booksRes.data.books || []);
      } catch (err) {
        console.error("Load error:", err);
        toast.error("Failed to fetch students or books.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  /* --------------------------------------------------------------------- */
  /* 🔐 Submit Assignment                                                   */
  /* --------------------------------------------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!studentId || !bookId || !accessCode) {
      toast.error("All fields except expiry date are required.");
      return;
    }

    try {
      const token = localStorage.getItem("bba_admin_token");

      await axios.post(
        `${API}/api/admin/student-books`,
        {
          studentId,
          bookId,
          accessCode,
          providerLink,
          expiresAt: expiresAt || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Access code assigned successfully!");

      // Reset form
      setStudentId("");
      setBookId("");
      setAccessCode("");
      setProviderLink("");
      setExpiresAt("");
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to assign access code.");
    }
  }

  /* --------------------------------------------------------------------- */
  /* UI                                                                    */
  /* --------------------------------------------------------------------- */

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-300">
        Loading…
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-300">
        Assign Access Code
      </h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Student */}
        <div>
          <label className="block mb-1 text-gray-600 dark:text-gray-300">
            Select Student
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
            required
          >
            <option value="">Choose Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.email})
              </option>
            ))}
          </select>
        </div>

        {/* Book */}
        <div>
          <label className="block mb-1 text-gray-600 dark:text-gray-300">
            Select Book
          </label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
            required
          >
            <option value="">Choose Book</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} — {b.isbn}
              </option>
            ))}
          </select>
        </div>

        {/* Access Code */}
        <div>
          <label className="block mb-1 text-gray-600 dark:text-gray-300">
            Access Code
          </label>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="e.g. ENG-1234-2025"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Provider Link */}
        <div>
          <label className="block mb-1 text-gray-600 dark:text-gray-300">
            Provider Link
          </label>
          <input
            type="url"
            value={providerLink}
            onChange={(e) => setProviderLink(e.target.value)}
            placeholder="https://www.cambridgego.org/…"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block mb-1 text-gray-600 dark:text-gray-300">
            Expiry Date (optional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
          />
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold">
          Assign Access Code
        </button>
      </form>
    </div>
  );
}
