import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import RootClientWrapper from "./RootClientWrapper";
import { CartProvider } from "../context/CartContext"; // ✅ Global Cart Context
import CartFloatingButton from "../components/CartFloatingButton"; // ✅ Floating Cart Button

const inter = Inter({ subsets: ["latin"] });

// ✅ Metadata for SEO and title
export const metadata = {
  title: "Bethel Bridge Academy (BBA)",
  description: "A homeschool support platform for parents and students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* ✅ Wrap all client-side app with CartProvider */}
        <CartProvider>
          {/* ✅ Keep RootClientWrapper for existing client logic */}
          <RootClientWrapper>{children}</RootClientWrapper>

          {/* ✅ Floating Global Cart Button (visible when cart not empty) */}
          <CartFloatingButton />

          {/* ✅ Toast Notifications (keep styling) */}
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
        </CartProvider>
      </body>
    </html>
  );
}
