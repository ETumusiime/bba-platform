"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Trash2,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AdminParentsPage() {
  const router = useRouter();

  /* -------------------------------------------------------------------------- */
  /* STATE */
  /* -------------------------------------------------------------------------- */
  const [mounted, setMounted] = useState(false);

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [deletingParent, setDeletingParent] = useState(null);

  /* -------------------------------------------------------------------------- */
  /* AUTH CHECK */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("bba_admin_token")
      : null;

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setMounted(true);
  }, [router]);

  /* -------------------------------------------------------------------------- */
  /* LOAD PARENTS */
  /* -------------------------------------------------------------------------- */
  async function loadParents() {
    if (!mounted) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(
        `${API}/api/admin/parents?page=${page}&search=${search}&status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to load parents");
        return;
      }

      setParents(json.data || []);
      setPages(json.pagination.pages);
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  /* Load on page/status change */
  useEffect(() => {
    loadParents();
  }, [mounted, page, status]); // eslint-disable-line

  /* Debounced search */
  useEffect(() => {
    const delay = setTimeout(loadParents, 400);
    return () => clearTimeout(delay);
  }, [search]); // eslint-disable-line

  /* -------------------------------------------------------------------------- */
  /* APPROVE PARENT */
  /* -------------------------------------------------------------------------- */
  async function approveParent(id) {
    try {
      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(`${API}/api/admin/parents/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.success) return toast.error(json.message);

      toast.success("Parent approved");
      loadParents();
    } catch {
      toast.error("Error approving parent");
    }
  }

  /* -------------------------------------------------------------------------- */
  /* DELETE PARENT */
  /* -------------------------------------------------------------------------- */
  async function deleteParentConfirmed() {
    if (!deletingParent) return;

    try {
      const token = localStorage.getItem("bba_admin_token");

      const res = await fetch(
        `${API}/api/admin/parents/${deletingParent.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();

      if (!json.success) return toast.error(json.message);

      toast.success("Parent deleted");
      setDeletingParent(null);
      loadParents();
    } catch {
      toast.error("Delete failed");
    }
  }

  /* -------------------------------------------------------------------------- */
  /* FILTER BUTTON */
  /* -------------------------------------------------------------------------- */
  const FilterButton = ({ label, value }) => (
    <button
      onClick={() => {
        setStatus(value);
        setPage(1);
      }}
      className={`px-3 py-1.5 rounded text-sm border transition
        ${
          status === value
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
    >
      {label}
    </button>
  );

  if (!mounted)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Loading…
      </div>
    );

  /* -------------------------------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Manage Parents
      </h1>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Search box */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-full sm:w-80">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search name or email…"
            className="flex-1 bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2">
          <FilterButton label="All" value="ALL" />
          <FilterButton label="Approved" value="APPROVED" />
          <FilterButton label="Pending" value="PENDING" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : parents.length === 0 ? (
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">
            No parents found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {parents.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-3">{p.name || "—"}</td>
                  <td className="px-4 py-3 break-all">{p.email}</td>
                  <td className="px-4 py-3">{p.phone || "—"}</td>

                  <td className="px-4 py-3">
                    {p.approved ? (
                      <span className="text-green-600 dark:text-green-400">
                        Approved
                      </span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right flex justify-end gap-3">

                    {!p.approved && (
                      <button
                        onClick={() => approveParent(p.id)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <UserCheck size={16} />
                        Approve
                      </button>
                    )}

                    <button
                      onClick={() => setDeletingParent(p)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-4 py-2 rounded border text-sm ${
              page === 1
                ? "text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 hover:bg-gray-100"
            }`}
          >
            Previous
          </button>

          <button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            className={`px-4 py-2 rounded border text-sm ${
              page === pages
                ? "text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deletingParent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Delete Parent</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deletingParent.email}</strong>?  
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingParent(null)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={deleteParentConfirmed}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
