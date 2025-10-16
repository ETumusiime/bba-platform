import AdminNavbar from "../../components/AdminNavbar";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AdminNavbar />
        <main style={{ flexGrow: 1, backgroundColor: "#f7f7f7", padding: "2rem" }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
