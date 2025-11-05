"use client";

import { Suspense } from "react";
import BookPreviewContent from "./BookPreviewContent";

export default function BookPreviewPage() {
  return (
    <Suspense fallback={<p>Loading preview...</p>}>
      <BookPreviewContent />
    </Suspense>
  );
}
