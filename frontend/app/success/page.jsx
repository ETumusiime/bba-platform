"use client";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="bg-white shadow-md rounded-xl p-10 text-center max-w-lg">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful 🎉
        </h1>

        <p className="text-gray-700 mb-6">
          Thank you for your payment. Your order has been received and is now
          being processed. You will receive an email confirmation shortly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/books"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
