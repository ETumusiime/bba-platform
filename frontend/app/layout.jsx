import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import RootClientWrapper from "./RootClientWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bethel Bridge Academy (BBA)",
  description: "A homeschool support platform for parents and students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <RootClientWrapper>{children}</RootClientWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
