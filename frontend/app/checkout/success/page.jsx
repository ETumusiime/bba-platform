"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const txRef = searchParams.get("txRef");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------------------- */
  /* ⏳ Fetch Order Details                                                 */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!orderId) return;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
        const json = await res.json();

        if (json.success) {
          setOrder(json.data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [orderId]);

  /* ---------------------------------------------------------------------- */
  /* ❌ no orderId provided                                                 */
  /* ---------------------------------------------------------------------- */
  if (!orderId) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>
        <p className="mb-4">No order reference was supplied.</p>

        <button
          onClick={() => router.push("/cart")}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* ⏳ loading                                                             */
  /* ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <p className="text-gray-600">Loading your order…</p>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* ❌ no order returned                                                   */
  /* ---------------------------------------------------------------------- */
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>

        <button
          onClick={() => router.push("/cart")}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* ✅ SUCCESS PAGE                                                       */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="max-w-3xl mx-auto py-16">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Payment Successful 🎉
      </h1>

      <p className="mb-6 text-gray-700">
        Thank you, <strong>{order.parentName}</strong>.  
        Your payment has been received and your order has been recorded.
      </p>

      {/* --------------------------- ORDER SUMMARY ------------------------- */}
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Order Summary</h2>

        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Transaction Ref:</strong> {txRef || order.flutterwaveTxRef}</p>
        <p><strong>Status:</strong> {order.paymentStatus}</p>

        <p className="mt-2 text-lg font-semibold text-blue-700">
          Total Paid: UGX {order.grandTotalUGX.toLocaleString()}
        </p>
      </div>

      {/* --------------------------- BOOKS PURCHASED ----------------------- */}
      <div className="border rounded-lg p-4 mb-6 bg-white">
        <h2 className="text-xl font-semibold mb-3">Books Purchased</h2>
        <ul className="list-disc ml-6 space-y-1">
          {order.items?.map((item) => (
            <li key={item.id}>
              {item.title}  
              — {item.quantity} × UGX {item.retailPriceUGX.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      {/* --------------------------- ACTION BUTTON ------------------------- */}
      <button
        onClick={() => router.push("/dashboard")}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Go to Parent Dashboard
      </button>
    </div>
  );
}
