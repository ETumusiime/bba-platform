"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

/* -------------------------------------------------------------------------- */
/* 🌍 Backend Base URL                                                        */
/* -------------------------------------------------------------------------- */
const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/* -------------------------------------------------------------------------- */
/* 🧠 Create Context                                                          */
/* -------------------------------------------------------------------------- */
const CartContext = createContext();

/* -------------------------------------------------------------------------- */
/* 💡 Custom Hook (with safety check)                                         */
/* -------------------------------------------------------------------------- */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

/* -------------------------------------------------------------------------- */
/* 🛒 Provider Component                                                      */
/* -------------------------------------------------------------------------- */
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  console.log("🛒 CartProvider mounted");

  // ⚙️ Load from localStorage on first render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("bba_cart");
      if (storedCart) setCart(JSON.parse(storedCart));
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }, []);

  // 💾 Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem("bba_cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cart]);

  /* ------------------------------------------------------------------------ */
  /* ➕ Add Book                                                              */
  /* ------------------------------------------------------------------------ */
  const addBook = async (book) => {
    try {
      const existing = cart.find(
        (item) => item.book_isbn === book.isbn || item.isbn === book.isbn
      );

      let updatedCart;
      if (existing) {
        updatedCart = cart.map((item) =>
          item.book_isbn === book.isbn || item.isbn === book.isbn
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        toast.success("📚 Quantity increased");
      } else {
        updatedCart = [
          ...cart,
          {
            ...book,
            book_isbn: book.isbn,
            title: book.title,
            price: book.price,
            cover_url:
              book.cover_url?.startsWith("http")
                ? book.cover_url
                : book.image_url?.startsWith("http")
                ? book.image_url
                : `${API}${book.image_url || book.cover_url || ""}`,
            quantity: 1,
          },
        ];
        toast.success("🛒 Added to cart");
      }

      setCart(updatedCart);

      // 🔗 Optional: sync with backend
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          book_isbn: book.isbn,
          quantity: 1,
        }),
      });
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart");
    }
  };

  /* ------------------------------------------------------------------------ */
  /* ➖ Update Quantity                                                       */
  /* ------------------------------------------------------------------------ */
  const updateQuantity = (isbn, quantity) => {
    try {
      const updatedCart = cart
        .map((item) =>
          item.book_isbn === isbn || item.isbn === isbn
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      setCart(updatedCart);
      localStorage.setItem("bba_cart", JSON.stringify(updatedCart));
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* ❌ Remove Book                                                           */
  /* ------------------------------------------------------------------------ */
  const removeBook = async (isbn) => {
    try {
      const updatedCart = cart.filter(
        (item) => item.book_isbn !== isbn && item.isbn !== isbn
      );
      setCart(updatedCart);
      localStorage.setItem("bba_cart", JSON.stringify(updatedCart));
      toast("🗑️ Removed from cart", { icon: "🗑️" });

      await fetch(`/api/cart/remove/${isbn}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1 }),
      });
    } catch (err) {
      console.error("Remove from cart error:", err);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* 🧮 Total Price                                                           */
  /* ------------------------------------------------------------------------ */
  const totalPrice = cart.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  /* ------------------------------------------------------------------------ */
  /* 🔁 Clear Cart                                                            */
  /* ------------------------------------------------------------------------ */
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("bba_cart");
    toast("🧹 Cart cleared");
  };

  /* ------------------------------------------------------------------------ */
  /* 🎁 Provide Context Values                                                */
  /* ------------------------------------------------------------------------ */
  return (
    <CartContext.Provider
      value={{ cart, addBook, updateQuantity, removeBook, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}
