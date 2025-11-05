"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaSignOutAlt,
  FaCalendarAlt,
  FaImage,
} from "react-icons/fa";

/* -------------------------------------------------------------------------- */
/* 🎓 Category → Year Mapping (Cambridge style but without word "Cambridge")  */
/* -------------------------------------------------------------------------- */
const categoryYears = {
  "Early Years": ["Year 1"],
  Primary: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
  "Lower Secondary": ["Year 7", "Year 8", "Year 9"],
  "Upper Secondary": ["Year 10", "Year 11"],
  Advanced: ["Year 12", "Year 13"],
};

export default function UploadBookPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    grade_year: "",
    subject: "",
    edition: "", // ✅ Added Edition field
    date_published: "",
    price: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* ✏️ Handle Input Changes                                                    */
  /* -------------------------------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------------------------------------------------------------- */
  /* 🖼️ Handle File Selection + Live Preview                                   */
  /* -------------------------------------------------------------------------- */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🚀 Submit Upload                                                          */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a book cover image.");
      return;
    }

    const uploadData = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      uploadData.append(key, value)
    );
    uploadData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/books/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("✅ Book uploaded successfully!");
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        grade_year: "",
        subject: "",
        edition: "",
        date_published: "",
        price: "",
      });
      setFile(null);
      setPreview(null);
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🚪 Logout                                                                 */
  /* -------------------------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast("👋 Logged out successfully!");
    router.push("/admin/login");
  };

  /* -------------------------------------------------------------------------- */
  /* 🧱 Render                                                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-10">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-700 mb-4 sm:mb-0">
            📘 Upload New Book
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/books-management")}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition shadow-sm"
            >
              <FaArrowLeft /> Back to Management
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Book Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Edition */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Edition
            </label>
            <input
              type="text"
              name="edition"
              placeholder="e.g. Second Edition"
              value={formData.edition}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Category + Year */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Category</option>
                {Object.keys(categoryYears).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Year
              </label>
              <select
                name="grade_year"
                value={formData.grade_year}
                onChange={handleChange}
                required
                disabled={!formData.category}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 ${
                  formData.category
                    ? "bg-white"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              >
                <option value="">Select Year</option>
                {formData.category &&
                  categoryYears[formData.category]?.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Subject + Date Published */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Date Published
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="month"
                  name="date_published"
                  value={formData.date_published}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Price (UGX)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Book Cover Image
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 mb-3"
            />
            {preview ? (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-auto rounded-lg shadow-md border border-gray-200 object-contain"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center w-40 h-56 bg-gray-100 border border-gray-300 rounded-lg text-gray-400 text-sm mx-auto">
                <FaImage className="mr-2" /> No Preview
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition font-semibold w-full sm:w-auto mx-auto"
          >
            <FaCloudUploadAlt />
            {loading ? "Uploading..." : "Upload Book"}
          </button>
        </form>
      </div>
    </main>
  );
}
