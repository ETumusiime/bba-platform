"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  ShieldCheck,
  Loader2,
  LockReset,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminStudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState(null);
  const [books, setBooks] = useState([]);

  /* ---------------------------------------------------------------------- */
  /* 🔐 Admin auth check                                                     */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("bba_admin_token")
        : null;

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setMounted(true);
  }, [router]);

  /* ---------------------------------------------------------------------- */
  /* 📥 Load student profile                                                 */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!mounted) return;
    loadStudent();
  }, [mounted, studentId]);

  async function loadStudent() {
    try {
      setLoading(true);
      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(`${API}/api/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setStudent(json.student);
      setBooks(json.student.assignedBooks || []);
    } catch (err) {
      toast.error(err.message || "Failed to load student");
      router.replace("/admin/students");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 🔐 Reset password                                                      */
  /* ---------------------------------------------------------------------- */
  async function resetPassword() {
    try {
      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(
        `${API}/api/admin/students/${studentId}/reset-password`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (!json.success) throw new Error("Reset failed");

      toast.success(`New password: ${json.newPassword}`);
    } catch (err) {
      toast.error(err.message || "Error resetting password");
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 🗑 Delete student                                                        */
  /* ---------------------------------------------------------------------- */
  async function deleteStudent() {
    if (!confirm("Are you sure? This action is permanent.")) return;

    try {
      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(`${API}/api/admin/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.success) throw new Error("Delete failed");

      toast.success("Student deleted");
      router.replace("/admin/students");
    } catch (err) {
      toast.error(err.message || "Error deleting student");
    }
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="space-y-8">
      {/* Back & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Student Profile
        </h1>
      </div>

      {/* ========================= STUDENT CARD ============================ */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          Student Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-500">Name</p>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {student.name}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Email</p>
            <p className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Mail className="h-4 w-4 text-slate-400" />
              {student.email}
            </p>
          </div>

          <div>
            <p className="text-slate-500">School Year</p>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {student.schoolYear}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Created At</p>
            <p className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Calendar className="h-4 w-4 text-slate-400" />
              {new Date(student.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={resetPassword}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            <LockReset className="h-4 w-4" />
            Reset Password
          </button>

          <button
            onClick={deleteStudent}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
            Delete Student
          </button>
        </div>
      </div>

      {/* ======================= PARENT INFORMATION ========================= */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          Parent Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-slate-500">Name</p>
            <p className="font-medium">{student.parent?.name}</p>
          </div>

          <div>
            <p className="text-slate-500">Email</p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              {student.parent?.email}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Phone</p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              {student.parent?.phone || "Not set"}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Location</p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              {student.parent?.city}, {student.parent?.country}
            </p>
          </div>
        </div>
      </div>

      {/* ======================= ASSIGNED BOOKS ============================= */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Assigned Books ({books.length})
        </h2>

        {books.length === 0 ? (
          <p className="text-slate-500 text-sm">No books assigned.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex gap-4 bg-slate-50 dark:bg-slate-900"
              >
                <img
                  src={
                    b.cover_url
                      ? `${API}${b.cover_url}`
                      : "/default-book-cover.png"
                  }
                  className="h-20 w-16 object-cover rounded"
                  alt={b.title}
                />

                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {b.title}
                  </p>
                  <p className="text-slate-500">{b.subject}</p>
                  <p className="text-xs text-slate-400">
                    Year: {b.year} | ISBN: {b.isbn}
                  </p>
                  <p className="text-xs text-slate-400">
                    Assigned:{" "}
                    {new Date(b.assignedAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
