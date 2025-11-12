"use client";

import { useCart } from "../../context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function CartPage() {
  const { cart, totalPrice, removeBook, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    router.push("/checkout");
  };

  return (
    <main className="page-transition min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-indigo-700">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <p className="text-center text-gray-600 py-12">
            Your cart is empty.{" "}
            <Link href="/book-selection" className="text-blue-600 hover:underline">
              Continue Shopping
            </Link>
          </p>
        ) : (
          <>
            {/* 🧾 Cart Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm md:text-base border border-gray-100 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-600">
                      Book
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-right font-medium text-gray-600">
                      Price (UGX)
                    </th>
                    <th className="py-3 px-4 text-center font-medium text-gray-600">
                      Remove
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <tr
                      key={item.book_isbn || item.isbn || item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* 🖼️ Book + Title */}
                      <td className="py-3 px-4 flex items-center gap-4">
                        <div className="w-16 h-24 relative flex-shrink-0 bg-white rounded border border-gray-200 overflow-hidden">
                          <Image
                            src={
                              item.cover_url?.startsWith("http")
                                ? item.cover_url
                                : `${API}${item.cover_url || item.image_url || ""}`
                            }
                            alt={item.title || "Book cover"}
                            width={100}
                            height={130}
                            unoptimized
                            className="object-contain rounded-md fade-in"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-book.png";
                            }}
                          />
                        </div>
                        <span className="font-medium text-gray-800 leading-tight">
                          {item.title}
                        </span>
                      </td>

                      {/* 🔢 Quantity Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.book_isbn || item.isbn || item.id,
                                item.quantity - 1
                              )
                            }
                            className="px-2 py-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span className="w-6 text-center text-gray-800 font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.book_isbn || item.isbn || item.id,
                                item.quantity + 1
                              )
                            }
                            className="px-2 py-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* 💰 Price */}
                      <td className="py-3 px-4 text-right text-gray-800 font-semibold">
                        {(item.price * item.quantity).toLocaleString()}
                      </td>

                      {/* ❌ Remove */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            removeBook(item.book_isbn || item.isbn || item.id)
                          }
                          className="text-red-500 hover:text-red-700 transition"
                          title="Remove from cart"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 💳 Summary */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 border-t pt-6">
              <p className="text-lg font-semibold text-gray-700 mb-4 md:mb-0">
                Total:{" "}
                <span className="text-indigo-700 text-xl font-bold">
                  UGX {totalPrice.toLocaleString()}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={clearCart}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition"
                >
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white shadow-md transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🧩 Fade-in image helper */}
      <style jsx global>{`
        .fade-in {
          opacity: 0;
          transition: opacity 0.2s ease-in;
        }
        .fade-in[src],
        .fade-in.loaded {
          opacity: 1;
        }
      `}</style>
    </main>
  );
}
