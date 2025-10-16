export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 px-6 text-center">
      <div className="max-w-2xl">
        <img
          src="/logo.svg"
          alt="BBA Logo"
          className="mx-auto mb-8 w-28 h-28 drop-shadow-lg"
        />
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4">
          Welcome to <span className="text-indigo-800">Bethel Bridge Academy (BBA)</span>
        </h1>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          BBA is a <strong>homeschool support platform</strong> designed to make digital learning simple, fun,
          and faith-driven. Access Cambridge-style resources, book tutors, track progress,
          and manage payments — all in one place.
        </p>
        <a
          href="/login"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-md"
        >
          Go to Login Page →
        </a>
      </div>
    </main>
  );
}
