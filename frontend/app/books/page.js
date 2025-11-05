"use client";

import { Suspense } from "react";
import BooksContent from "./BooksContent";

export default function BooksPage() {
  return (
    <Suspense fallback={<p>Loading books...</p>}>
      <BooksContent />
    </Suspense>
  );
}
