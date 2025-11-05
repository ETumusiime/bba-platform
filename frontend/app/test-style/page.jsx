export default function TestStylePage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-6">🎨 Tailwind is Working!</h1>
      <p className="text-lg mb-8">
        If you can see this gradient and white text, Tailwind CSS is fully active 🎉
      </p>
      <button className="px-6 py-3 bg-white text-blue-600 rounded-lg shadow hover:bg-blue-100 transition">
        Beautiful Tailwind Button
      </button>
    </div>
  );
}
