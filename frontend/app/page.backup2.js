export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Top spacer to center content visually on large screens */}
      <div className="flex-1 flex items-center justify-center">
        <section className="text-center px-6">
          <img src="/bba-logo.svg" alt="BBA Logo" className="w-24 h-24 mx-auto mb-5" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
            Welcome to Bethel Bridge Academy (BBA)
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            A homeschool support platform for Cambridge learners—simple, fun, and faith-driven.
            Access resources, browse books, track progress, and manage payments — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/login" className="px-6 py-3 rounded-lg bg-blue-800 text-white font-semibold hover:bg-blue-700 transition">
              Go to Login →
            </a>
            <a href="/dashboard" className="px-6 py-3 rounded-lg border border-blue-800 text-blue-800 font-semibold hover:bg-blue-50 transition">
              Open Dashboard
            </a>
          </div>
        </section>
      </div>

      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bethel Bridge Academy • All rights reserved
      </footer>
    </main>
  );
}
