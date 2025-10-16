"use client";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { label: "Dashboard", href: "/admin" },
    { label: "Books", href: "/admin/books" },
  ];

  return (
    <nav
      style={{
        backgroundColor: "#007bff",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div>
        <strong style={{ cursor: "pointer" }} onClick={() => router.push("/admin")}>
          📘 BBA Admin
        </strong>
      </div>
      <div style={{ display: "flex", gap: "20px" }}>
        {navLinks.map((link) => (
          <span
            key={link.href}
            onClick={() => router.push(link.href)}
            style={{
              cursor: "pointer",
              borderBottom: pathname === link.href ? "2px solid white" : "none",
            }}
          >
            {link.label}
          </span>
        ))}
        <span
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          style={{ cursor: "pointer", fontWeight: "bold" }}
        >
          Logout
        </span>
      </div>
    </nav>
  );
}
