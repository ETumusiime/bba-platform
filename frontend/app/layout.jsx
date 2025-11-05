import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import RootClientWrapper from "./RootClientWrapper"; // 👈 new file that holds "use client" logic

const inter = Inter({ subsets: ["latin"] });

// ✅ keep metadata here — this file remains a Server Component
export const metadata = {
  title: "Bethel Bridge Academy (BBA)",
  description: "A homeschool support platform for parents and students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* 👇 move all client logic into a separate client wrapper */}
        <RootClientWrapper>{children}</RootClientWrapper>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: "0.95rem",
              background: "#fefefe",
              color: "#222",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px 12px",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
