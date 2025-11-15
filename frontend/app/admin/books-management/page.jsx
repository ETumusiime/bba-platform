"use client";
import { useRouter } from "next/navigation";
import { FaCloudUploadAlt, FaBookOpen } from "react-icons/fa";

export default function BooksManagementDashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-8 relative">

      {/* ------------------------------------------------------------- */}
      {/* 🎨 Header (Updated — Logout Removed)                          */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between w-full max-w-4xl mb-10">
        <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-400">
          Books Management
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-gray-600 text-lg mb-10 text-center">
        Manage your digital library easily — upload, edit, and view books.
      </p>

      {/* Button Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Upload New Book */}
        <button
          onClick={() => router.push("/admin/upload-book")}
          className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 border-2 border-blue-400 text-blue-700 font-semibold rounded-2xl shadow-md p-10 transition-all duration-200 hover:scale-105"
        >
          <FaCloudUploadAlt className="text-5xl mb-4 text-blue-600" />
          <span className="text-xl">Upload New Book</span>
        </button>

        {/* View Uploaded Books */}
        <button
          onClick={() => router.push("/admin/view-books")}
          className="flex flex-col items-center justify-center bg-white hover:bg-green-50 border-2 border-green-400 text-green-700 font-semibold rounded-2xl shadow-md p-10 transition-all duration-200 hover:scale-105"
        >
          <FaBookOpen className="text-5xl mb-4 text-green-600" />
          <span className="text-xl">View Uploaded Books</span>
        </button>
      </div>

      {/* Footer Text */}
      <p className="text-gray-400 text-sm mt-10">
        More features coming soon — Edit, Bulk Upload, Reports, and Analytics.
      </p>
    </main>
  );
}
