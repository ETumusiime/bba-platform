"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function ParentStudentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:5000";

  const loadStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bba_parent_token");
      const res = await fetch(`${API}/api/parent/children`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load");
      setStudents(data.children || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* ✏️ Handle edit + save                                                      */
  /* -------------------------------------------------------------------------- */
  const handleEdit = async (id) => {
    const token = localStorage.getItem("bba_parent_token");
    try {
      const res = await fetch(`${API}/api/parent/children/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Update failed");
      toast.success("✅ Student updated successfully");
      setEditing(null);
      loadStudents();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔑 Reset password                                                         */
  /* -------------------------------------------------------------------------- */
  const handleResetPassword = async (id) => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const token = localStorage.getItem("bba_parent_token");
    try {
      const res = await fetch(`${API}/api/parent/children/${id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Reset failed");
      toast.success("✅ Password reset successfully");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🚪 Logout & Navigation                                                     */
  /* -------------------------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("bba_parent_token");
    document.cookie =
      "bba_parent_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    toast.success("👋 Logged out");
    router.replace("/login");
  };

  /* -------------------------------------------------------------------------- */
  /* 🎨 UI Rendering                                                           */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 flex items-center gap-2">
            🎓 My Registered Students
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition shadow-sm"
            >
              ⬅ Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 py-8">Loading students…</p>
        ) : students.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No students registered yet.</p>
            <button
              onClick={() => router.push("/parent/students/new")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              ➕ Register a Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm sm:text-base rounded-lg overflow-hidden">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="py-2 px-3 text-left border-b">Name</th>
                  <th className="py-2 px-3 text-left border-b">Email</th>
                  <th className="py-2 px-3 text-left border-b">Year</th>
                  <th className="py-2 px-3 text-left border-b">DOB</th>
                  <th className="py-2 px-3 text-left border-b text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 border-b">
                      {editing === s.id ? (
                        <input
                          type="text"
                          value={editData.first_name || s.first_name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              first_name: e.target.value,
                            })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        `${s.first_name} ${s.last_name}`
                      )}
                    </td>

                    <td className="py-2 px-3 border-b">
                      {editing === s.id ? (
                        <input
                          type="email"
                          value={editData.email || s.email}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              email: e.target.value,
                            })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        s.email
                      )}
                    </td>

                    <td className="py-2 px-3 border-b">
                      {editing === s.id ? (
                        <input
                          type="number"
                          value={editData.school_year || s.school_year}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              school_year: e.target.value,
                            })
                          }
                          className="border rounded px-2 py-1 w-20"
                        />
                      ) : (
                        s.school_year
                      )}
                    </td>

                    <td className="py-2 px-3 border-b">
                      {editing === s.id ? (
                        <input
                          type="date"
                          value={
                            editData.dob ||
                            new Date(s.dob).toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            setEditData({ ...editData, dob: e.target.value })
                          }
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        new Date(s.dob).toLocaleDateString("en-GB")
                      )}
                    </td>

                    <td className="py-2 px-3 border-b text-center">
                      {editing === s.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(s.id)}
                            className="text-green-700 font-semibold mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="text-gray-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditing(s.id);
                              setEditData(s);
                            }}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordModal(true);
                              setEditing(s.id);
                            }}
                            className="text-yellow-600 hover:underline mr-2"
                          >
                            Reset PW
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔐 Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-indigo-700">
              Reset Student Password
            </h2>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border rounded-md px-3 py-2 w-full mb-3"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(editing)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
