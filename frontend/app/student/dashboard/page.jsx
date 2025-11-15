"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function StudentDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState("books");
  const [studentName, setStudentName] = useState("Student");

  /* -------------------------------------------------------------------------- */
  /* ✅ On Mount: Verify new student token + load student name                 */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // ✔ New student token
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("bba_student_token")
        : null;

    if (!token) {
      router.replace("/student/login?next=/student/dashboard");
      return;
    }

    // ✔ Load new student info format
    const stored = localStorage.getItem("bba_student_info");
    if (stored) {
      try {
        const stu = JSON.parse(stored);
        setStudentName(stu.fullName || stu.email || "Student");
      } catch {
        setStudentName("Student");
      }
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        Loading…
      </main>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🧭 Navigation & Actions                                                    */
  /* -------------------------------------------------------------------------- */
  const goBooks = () => router.push("/student/books");

  const comingSoon = () => {
    toast("🚧 Coming Soon ✨", { icon: "⏳", duration: 2000 });
  };

  function handleLogout() {
    // ✔ Remove new student tokens + data
    localStorage.removeItem("bba_student_token");
    localStorage.removeItem("bba_student_info");
    localStorage.removeItem("bba_student_name");

    toast.success("👋 Logged out", { duration: 2000 });
    router.replace("/student/login");
  }

  /* -------------------------------------------------------------------------- */
  /* 🎨 UI Rendering                                                            */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 py-8 px-4 flex flex-col items-center">
      <Toaster position="top-center" />

      <div className="w-full max-w-6xl flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">
            Welcome back, {studentName} 👋
          </h1>
          <p className="text-gray-600 text-sm">Explore your learning dashboard</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md shadow hover:bg-gray-200"
          >
            ⬅ Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 📘 BOOKS SECTION */}
      <Section
        title="📘 My Book Resources"
        open={open === "books"}
        onToggle={() => setOpen(open === "books" ? "" : "books")}
      >
        <Card title="Open Book Resources" icon="📖" onClick={goBooks} />
      </Section>

      {/* 🧠 SKILLS SECTION */}
      <Section
        title="🧠 Skills Development"
        open={open === "skills"}
        onToggle={() => setOpen(open === "skills" ? "" : "skills")}
      >
        <Card title="Coding & STEM" icon="💻" onClick={comingSoon} />
        <Card title="Arts & Creativity" icon="🎨" onClick={comingSoon} />
        <Card title="Entrepreneurship" icon="🚀" onClick={comingSoon} />
      </Section>

      {/* 👥 COMMUNITY SECTION */}
      <Section
        title="💬 Community"
        open={open === "community"}
        onToggle={() => setOpen(open === "community" ? "" : "community")}
      >
        <Card title="Join Discussion Group" icon="👥" onClick={comingSoon} />
        <Card title="Connect to Your Tutor" icon="🧑‍🏫" onClick={comingSoon} />
      </Section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 Reusable Components                                                     */
/* -------------------------------------------------------------------------- */

function Section({ title, open, onToggle, children }) {
  return (
    <div className="w-full max-w-6xl mb-4 border border-gray-200 rounded-xl bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-5 py-4 text-lg sm:text-xl font-semibold text-indigo-900"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-2xl">{open ? "−" : "+"}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl p-6 flex flex-col items-center justify-center shadow-md hover:shadow-xl transition bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:border-blue-300 text-center"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
        {title}
      </h3>
    </div>
  );
}
