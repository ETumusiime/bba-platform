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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  /* -------------------------------------------------------------------------- */
  /* 📌 Load students                                                           */
  /* -------------------------------------------------------------------------- */
  const loadStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bba_parent_token");

      const res = await fetch(`${API}/api/parent/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");

      setStudents(json.data || []);
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
  /* ✏️ SAVE EDIT                                                               */
  /* -------------------------------------------------------------------------- */
  const handleEditSave = async (studentId) => {
    const token = localStorage.getItem("bba_parent_token");

    try {
      const res = await fetch(`${API}/api/parent/students/${studentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Update failed");

      toast.success("Student updated successfully");
      setEditing(null);
      loadStudents();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔑 RESET PASSWORD                                                          */
  /* -------------------------------------------------------------------------- */
  const handleResetPassword = async (studentId) => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    const token = localStorage.getItem("bba_parent_token");

    try {
      const res = await fetch(`${API}/api/parent/students/${studentId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Reset failed");

      toast.success(`Password reset! New Password: ${json.data.tempPassword}`);
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🗑️ DELETE REQUEST                                                         */
  /* -------------------------------------------------------------------------- */
  const handleDeleteRequest = async (studentId) => {
    const token = localStorage.getItem("bba_parent_token");

    try {
      const res = await fetch(`${API}/api/parent/students/${studentId}/request-delete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Request failed");

      toast.success("Delete request sent to admin.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🚪 LOGOUT                                                                  */
  /* -------------------------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("bba_parent_token");
    toast.success("Logged out");
    router.replace("/login");
  };

  /* -------------------------------------------------------------------------- */
  /* 🎨 UI                                                                      */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 flex items-center gap-2">
            🎓 My Students
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              ⬅ Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-center text-gray-600 py-8">Loading…</p>
        ) : students.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No students registered yet.</p>
            <button
              onClick={() => router.push("/parent/students/new")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              ➕ Register Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="py-2 px-3 text-left border-b">Full Name</th>
                  <th className="py-2 px-3 text-left border-b">Email</th>
                  <th className="py-2 px-3 text-left border-b">Year</th>
                  <th className="py-2 px-3 text-left border-b">DOB</th>
                  <th className="py-2 px-3 text-center border-b">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    {/* Full Name */}
                    <td className="py-2 px-3 border-b">
                      {editing === s.id ? (
                        <input
                          value={editData.fullName || s.fullName}
                          onChange={(e) =>
                            setEditData({ ...editData, fullName: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        s.fullName
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-2 px-3 border-b">{s.email}</td>

                    {/* School Year */}
                    <td className="py-2 px-3 border-b">
                      {editing === s.id ? (
                        <input
                          type="number"
                          value={editData.schoolYear || s.schoolYear}
                          onChange={(e) =>
                            setEditData({ ...editData, schoolYear: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-20"
                        />
                      ) : (
                        s.schoolYear
                      )}
                    </td>

                    {/* DOB */}
                    <td className="py-2 px-3 border-b">
                      {new Date(s.dateOfBirth).toLocaleDateString("en-GB")}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-2 px-3 border-b text-center">
                      {editing === s.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(s.id)}
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
                          {/* EDIT */}
                          <button
                            onClick={() => {
                              setEditing(s.id);
                              setEditData(s);
                            }}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>

                          {/* RESET PW */}
                          <button
                            onClick={() => {
                              setShowPasswordModal(true);
                              setEditing(s.id);
                            }}
                            className="text-yellow-600 hover:underline mr-2"
                          >
                            Reset PW
                          </button>

                          {/* DELETE REQUEST */}
                          <button
                            onClick={() => handleDeleteRequest(s.id)}
                            className="text-red-600 hover:underline"
                          >
                            Request Delete
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

      {/* 🔐 RESET PASSWORD MODAL */}
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
