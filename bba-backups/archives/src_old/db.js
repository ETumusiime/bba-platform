import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// Use DATABASE_URL directly (works for Neon, Supabase, Render, etc.)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
