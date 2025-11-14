"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref"); // Flutterwave callback reference
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* 🔍 Fetch order details using txRef                                        */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    async function loadOrder() {
      if (!txRef) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/orders/by-txref/${txRef}`);
        const json = await res.json();

        if (json.success) {
          setOrder(json.data);
        }
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [txRef]);

  /* -------------------------------------------------------------------------- */
  /* 🔧 UI States                                                              */
  /* -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading receipt...</p>
      </main>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🖼️ Success Page                                                           */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="bg-white shadow-md rounded-xl p-10 text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful 🎉
        </h1>

        <p className="text-gray-700 mb-6">
          Thank you for your payment. Your order has been received and is now
          being processed. You will receive an email confirmation shortly.
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* 📄 Order Details (if available)                                   */}
        {/* ------------------------------------------------------------------ */}
        {order ? (
          <div className="text-left bg-gray-50 border rounded-lg p-5 mb-6">
            <h2 className="text-xl font-semibold mb-3">Order Summary</h2>

            <p className="text-sm mb-1">
              <strong>Order ID:</strong> {order.id}
            </p>
            <p className="text-sm mb-1">
              <strong>Transaction Ref:</strong> {order.txRef}
            </p>
            <p className="text-sm mb-1">
              <strong>Email:</strong> {order.parentEmail}
            </p>
            <p className="text-sm mb-3">
              <strong>Amount Paid:</strong>{" "}
              UGX {order.totalUGX.toLocaleString()}
            </p>

            <h3 className="text-md font-semibold mt-4 mb-2">
              Books Purchased
            </h3>

            <div className="space-y-2">
              {order.items_json?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b py-1 text-sm"
                >
                  <span>{item.title}</span>
                  <span>
                    UGX {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-6">
            Could not load order details.
          </p>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Navigation Buttons                                                */}
        {/* ------------------------------------------------------------------ */}
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
