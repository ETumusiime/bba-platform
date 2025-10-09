"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === Check for token and fetch users ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          // Token invalid or expired
          localStorage.removeItem("token");
          router.push("/admin/login");
          return;
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  // === Handle logout ===
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  if (loading)
    return (
      <div style={styles.center}>
        <h3>Loading users...</h3>
      </div>
    );

  if (error)
    return (
      <div style={styles.center}>
        <p style={styles.error}>{error}</p>
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>👥 Registered Users</h2>
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>{u.id}</td>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// === Inline Styles ===
const styles = {
  container: {
    maxWidth: "800px",
    margin: "60px auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    padding: "10px 0",
  },
  td: {
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  error: { color: "red", marginBottom: "10px" },
};
