// backend/db.js
import pkg from "pg";
const { Pool } = pkg;

// ✅ PostgreSQL connection pool setup
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "bba",
  password: process.env.PGPASSWORD || "",
  port: process.env.PGPORT || 5432,
});

// ✅ Event listener for unexpected runtime errors
pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
});

export default pool;
