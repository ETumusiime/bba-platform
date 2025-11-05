import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminBookUpload from "./pages/admin/AdminBookUpload";

// ✅ Simple Home component (default route)
const Home = () => (
  <div style={{ textAlign: "center", marginTop: "40px" }}>
    <h2>Welcome to the BBA Platform</h2>
    <p>Use the navigation bar above to access admin tools.</p>
  </div>
);

const App = () => {
  return (
    <Router>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>📚 BBA Admin</h2>
        <nav>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/admin/upload-book" style={styles.link}>Upload Book</Link>
        </nav>
      </div>

      <div style={styles.container}>
        <Routes>
          {/* 🏠 Default Home Route */}
          <Route path="/" element={<Home />} />

          {/* 👩‍💼 Admin Routes */}
          <Route path="/admin/upload-book" element={<AdminBookUpload />} />

          {/* Future routes for parents */}
          {/* <Route path="/books/preview" element={<BookPreview />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0d6efd",
    padding: "10px 20px",
    color: "white",
  },
  logo: {
    margin: 0,
    fontSize: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    marginLeft: "15px",
    fontWeight: "bold",
  },
  container: {
    padding: "20px",
  },
};

export default App;
