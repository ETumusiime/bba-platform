"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BookViewerPage() {
  const params = useSearchParams();
  const router = useRouter();
  const ticket = params.get("ticket");
  const title = params.get("title") || "Book Viewer";

  // ✅ Safety guard: prevent blank iframe when no ticket is provided
  if (!ticket) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-center">
          <p>No book selected.</p>
          <button
            onClick={() => router.push("/student/books")}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to My Books
          </button>
        </div>
      </main>
    );
  }

  // ✅ Build the proxy URL safely
  const proxyUrl = `/api/student/books/proxy?ticket=${encodeURIComponent(ticket)}`;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="text-lg font-semibold text-indigo-800">{title}</h1>
        <button
          onClick={() => router.push("/student/books")}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
        >
          ← Back to My Books
        </button>
      </header>

      <div className="flex-1">
        <iframe
          title="Book Viewer"
          src={proxyUrl} // this points to your backend proxy (e.g. Cambridge GO)
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{ width: "100%", height: "calc(100vh - 64px)", border: 0 }}
        />
      </div>
    </main>
  );
}
