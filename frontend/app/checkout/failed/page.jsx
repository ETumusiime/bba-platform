"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason") || "unknown";

  return (
    <div className="max-w-3xl mx-auto py-16">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Payment Not Completed
      </h1>

      <p className="mb-4 text-gray-700">
        Your payment did not go through.  
        <br />
        Reason: <strong>{reason}</strong>
      </p>

      <button
        onClick={() => router.push("/checkout")}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Back to Checkout
      </button>
    </div>
  );
}
