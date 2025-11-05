"use client";

import React from "react";
import { GlobalProviders } from "./providers.jsx";
import ClientLayout from "./ClientLayout";

export default function RootClientWrapper({ children }) {
  return (
    <GlobalProviders>
      <ClientLayout>{children}</ClientLayout>
    </GlobalProviders>
  );
}
