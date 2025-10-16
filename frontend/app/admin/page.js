"use client";
import { createClient } from "@supabase/supabase-js";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useSupabaseAuth";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}>
        <h1>Welcome to the Admin Dashboard</h1>
        <p>Logged in as: <strong>{user?.email}</strong></p>
        <button
          style={{
            marginTop: "20px",
            padding: "10px 16px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer"
          }}
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
        >
          Sign Out
        </button>
      </div>
    </ProtectedRoute>
  );
}
