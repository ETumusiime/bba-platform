import "./globals.css";
import { AuthProvider } from "../hooks/useSupabaseAuth";

export const metadata = {
  title: "Bethel Bridge Academy",
  description: "BBA Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
