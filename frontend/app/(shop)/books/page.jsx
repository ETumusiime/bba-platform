"use client";

import { useCart } from "../../context/CartContext";

// This page should never render anything.
// It only prevents flicker or unwanted redirects.
export default function BooksPage() {
  // We do not use useCart here, but the import stays
  // to keep consistent path mapping across all book routes.
  return null;
}
