"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Search,
  Mail,
  Phone,
  Award,
  Loader2,
  AlertCircle,
  LibraryBig,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminStudentsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState(""); // filter by school year

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------------------- */
  /* 🔐 Admin Auth Check                                                     */
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
  /* 📥 Load students whenever page/search/yearFilter changes                */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("bba_admin_token");

        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });

        if (search.trim()) params.set("search", search.trim());
        if (yearFilter) params.set("year", yearFilter);

        const res = await fetch(`${API}/api/admin/students?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load students");
        }

        if (!cancelled) {
          setStudents(json.data || []);
          setTotal(json.pagination?.total || 0);
          setTotalPages(json.pagination?.totalPages || 1);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Students load error:", err);
          setError(err.message || "Server error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [mounted, page, search, yearFilter]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 dark:text-slate-300">
        Loading students…
      </div>
    );
  }

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  /* Years (UK/Cambridge Standard) */
  const yearLevels = [
    "Year 1","Year 2","Year 3","Year 4","Year 5","Year 6",
    "Year 7","Year 8","Year 9","Year 10","Year 11","Year 12","Year 13"
  ];

  return (
    <div className="space-y-8">

      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Students
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage all registered students and their assigned books.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          {/* Search */}
          <div className="sm:w-72 w-full">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Search students
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                placeholder="Email, name, parent..."
                className="w-full bg-transparent outline-none text-xs"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Filter by Year Level
            </label>
            <select
              className="mt-1 w-full sm:w-40 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              value={yearFilter}
              onChange={(e) => {
                setPage(1);
                setYearFilter(e.target.value);
              }}
            >
              <option value="">All Years</option>
              {yearLevels.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error State */}
      {/* ------------------------------------------------------------------ */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Students Table */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No students found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">Parent</th>
                  <th className="px-4 py-3 text-left">Books</th>
                  <th className="px-4 py-3 text-left">Registered</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    {/* Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{s.email}</span>
                      </div>
                    </td>

                    {/* Year */}
                    <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {s.yearLevel || "—"}
                    </td>

                    {/* Parent */}
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {s.parentEmail || "—"}
                    </td>

                    {/* Books Count */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <LibraryBig className="h-4 w-4" />
                        <span className="font-medium">
                          {s.booksCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Registration date */}
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pagination */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">

        <div>
          {total > 0 ? (
            <span>
              Showing <span className="font-medium">{startIdx}</span>–
              <span className="font-medium">{endIdx}</span> of{" "}
              <span className="font-medium">{total}</span> students
            </span>
          ) : (
            <span>No students to display.</span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50 bg-white dark:bg-slate-900"
          >
            <ChevronLeft className="h-3 w-3" /> Prev
          </button>

          <span className="px-2">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 disabled:opacity-50 bg-white dark:bg-slate-900"
          >
            Next <ChevronRight className="h-3 w-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
