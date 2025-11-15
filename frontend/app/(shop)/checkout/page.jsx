"use client";

import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const FLW_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY;

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();

  /* -------------------------------------------------------------------------- */
  /* 🧑‍🧑 Parent Info                                                          */
  /* -------------------------------------------------------------------------- */
  const [parentForm, setParentForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "Uganda",
    city: "",
    address: "",
  });

  /* -------------------------------------------------------------------------- */
  /* 👧 Student Assignment                                                     */
  /* -------------------------------------------------------------------------- */
  const [studentAssignments, setStudentAssignments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure assignment exists per ISBN
  useEffect(() => {
    const initial = {};
    for (const item of cart) {
      const key = item.isbn || item.book_isbn;
      initial[key] = studentAssignments[key] || "";
    }
    setStudentAssignments((prev) => ({ ...initial, ...prev }));
  }, [cart.length]); // eslint-disable-line

  /* -------------------------------------------------------------------------- */
  /* 🧪 Validation                                                             */
  /* -------------------------------------------------------------------------- */
  const validateForm = () => {
    if (!parentForm.name || !parentForm.email || !parentForm.phone) {
      toast.error("Please fill in name, email, and phone.");
      return false;
    }
    if (!cart.length) {
      toast.error("Your cart is empty.");
      return false;
    }
    for (const item of cart) {
      const key = item.isbn || item.book_isbn;
      if (!studentAssignments[key]) {
        toast.error(`Assign student for "${item.title}".`);
        return false;
      }
    }
    return true;
  };

  /* -------------------------------------------------------------------------- */
  /* 🌍 Backend Order Init (Step 1)                                            */
  /* -------------------------------------------------------------------------- */
  const [orderData, setOrderData] = useState(null);
  const [fwConfig, setFwConfig] = useState(null);

  async function initBackendOrder(e) {
    e.preventDefault();
    if (!validateForm()) return;

    if (!FLW_PUBLIC_KEY) {
      toast.error("Missing Flutterwave public key.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API}/api/orders/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: parentForm.name,
          parentEmail: parentForm.email,
          parentPhone: parentForm.phone,
          country: parentForm.country,
          city: parentForm.city,
          addressLine: parentForm.address,
          cart,
          studentAssignments,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Order creation failed.");
        return;
      }

      const { txRef, orderId, amount } = json.data;

      setOrderData({ txRef, orderId, amount });

      /* ---------------------------------------------------------------------- */
      /* 🌍 Configure Flutterwave Button (Step 2)                               */
      /* ---------------------------------------------------------------------- */
      setFwConfig({
        public_key: FLW_PUBLIC_KEY,
        tx_ref: txRef,
        amount,
        currency: "UGX",
        payment_options: "card,mobilemoneyuganda",
        customer: {
          email: parentForm.email,
          phonenumber: parentForm.phone,
          name: parentForm.name,
        },
        customizations: {
          title: "BethelBridge Academy – Digital Coursebooks",
          description: "Secure payment for Cambridge digital licenses",
          logo: "/bba-logo.png",
        },

        /* -------------------------------------------------------------------- */
        /* 🌍 SUCCESS CALLBACK → Update Order Status (Step 3)                  */
        /* -------------------------------------------------------------------- */
        callback: async (response) => {
          await finalizeBackendOrder(response);
        },

        onClose: () => {
          toast.error("Payment window closed.");
          router.push("/checkout/failed?reason=cancelled");
        },
      });

      toast.success("Order created — proceed to payment below.");
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🌍 Finalise Backend Order After Flutterwave Success                       */
  /* -------------------------------------------------------------------------- */
  async function finalizeBackendOrder(response) {
    try {
      const res = await fetch(`${API}/api/orders/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txRef: response.tx_ref,
          status: response.status,
          transactionId: response.transaction_id,
          rawFlutterwaveResponse: response,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error("Payment verification failed.");
        closePaymentModal();
        router.push("/checkout/failed?reason=verify_error");
        return;
      }

      if (response.status === "successful") {
        clearCart();
        closePaymentModal();
        toast.success("Payment successful!");
        router.push(
          `/checkout/success?orderId=${orderData.orderId}&txRef=${orderData.txRef}`
        );
      } else {
        toast.error("Payment failed or cancelled.");
        closePaymentModal();
        router.push("/checkout/failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error verifying payment.");
      closePaymentModal();
      router.push("/checkout/failed?reason=exception");
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 💰 Compute Total                                                         */
  /* -------------------------------------------------------------------------- */
  const computedTotal = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  }, [cart]);

  /* -------------------------------------------------------------------------- */
  /* 🖼️ UI                                                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Checkout
        </h1>

        {/* ------------------------------------------------------------------ */}
        {/* 🧾 ORDER SUMMARY                                                   */}
        {/* ------------------------------------------------------------------ */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Your Order</h2>

          {!cart.length ? (
            <p className="text-gray-500 text-center py-6">
              Your cart is currently empty.
            </p>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Book Title</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Amount (UGX)</th>
                    <th className="py-3 px-4 text-left">Assign to Student</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => {
                    const key = item.isbn || item.book_isbn;
                    return (
                      <tr key={idx} className="border-t">
                        <td className="py-3 px-4">{item.title}</td>
                        <td className="py-3 px-4 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {(item.price * item.quantity).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={studentAssignments[key] || ""}
                            placeholder="e.g. Tamba"
                            onChange={(e) =>
                              setStudentAssignments((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={2}
                      className="py-3 px-4 text-right font-semibold"
                    >
                      Total:
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">
                      UGX {computedTotal.toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 👨‍👩‍👧 Parent Information                                           */}
        {/* ------------------------------------------------------------------ */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Parent Information</h2>

          <form
            onSubmit={initBackendOrder}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Name */}
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2"
                value={parentForm.name}
                onChange={(e) =>
                  setParentForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1">Email Address</label>
              <input
                type="email"
                className="w-full border rounded-lg px-4 py-2"
                value={parentForm.email}
                onChange={(e) =>
                  setParentForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full border rounded-lg px-4 py-2"
                value={parentForm.phone}
                onChange={(e) =>
                  setParentForm((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>

            {/* Country */}
            <div>
              <label className="block mb-1">Country</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={parentForm.country}
                onChange={(e) =>
                  setParentForm((p) => ({ ...p, country: e.target.value }))
                }
              />
            </div>

            {/* City */}
            <div>
              <label className="block mb-1">City</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={parentForm.city}
                onChange={(e) =>
                  setParentForm((p) => ({ ...p, city: e.target.value }))
                }
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block mb-1">Address / Neighbourhood</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={parentForm.address}
                onChange={(e) =>
                  setParentForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* BUTTON AREA                                                       */}
            {/* ------------------------------------------------------------------ */}
            <div className="md:col-span-2 mt-8 flex justify-center">
              {!orderData ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting
                      ? "bg-green-400"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white font-semibold py-3 px-8 rounded-lg w-full md:w-1/2`}
                >
                  {isSubmitting
                    ? "Creating Order..."
                    : `Create Order (UGX ${computedTotal.toLocaleString()})`}
                </button>
              ) : (
                fwConfig && (
                  <div className="w-full md:w-1/2">
                    <FlutterWaveButton
                      {...fwConfig}
                      className="w-full mt-3 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
                      text={`Pay UGX ${orderData.amount.toLocaleString()}`}
                    />
                  </div>
                )
              )}
            </div>
          </form>

          {/* NAVIGATION */}
          <div className="mt-8 flex justify-between">
            <Link
              href="/cart"
              className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300"
            >
              ← Back to Cart
            </Link>

            <Link
              href="/book-selection"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Continue Shopping →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
