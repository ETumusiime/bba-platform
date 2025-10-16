// ===============================================
// sync_highres_books.js
// Prunes DB to only books that have a highres cover
// and inserts new rows for new covers.
// ===============================================
import fs from "fs";
import path from "path";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bba_db",
  password: "Alpha12345!!!!!",
  port: 5432,
});

const highresPath = "D:/BBA Coursebook Images/highres";

function normalizeIsbn(v) {
  return (v || "").replace(/[\s-]/g, "");
}

async function main() {
  console.log("🔄 Sync DB with highres folder…");

  // 1) scan folder
  const files = fs.readdirSync(highresPath).filter(f => f.toLowerCase().endsWith(".jpg"));
  const folderIsbns = new Set(files.map(f => normalizeIsbn(path.basename(f, ".jpg"))));
  console.log(`🖼️ Covers found: ${folderIsbns.size}`);

  // 2) read DB
  const { rows } = await pool.query("SELECT id, isbn, title FROM books");
  const dbByIsbn = new Map(rows.map(r => [normalizeIsbn(r.isbn), r]));

  // 3) delete DB rows without a cover
  for (const row of rows) {
    const key = normalizeIsbn(row.isbn);
    if (!folderIsbns.has(key)) {
      await pool.query("DELETE FROM books WHERE id = $1", [row.id]);
      console.log(`🗑️ Deleted DB row without cover: ${row.title || "(untitled)"} (${row.isbn})`);
    }
  }

  // 4) insert DB rows for new covers
  for (const isbn of folderIsbns) {
    if (!dbByIsbn.has(isbn)) {
      await pool.query(
        `INSERT INTO books (isbn, title, cover_path, cover_image_url)
         VALUES ($1, $2, $3, $4)`,
        [
          isbn,
          `Auto-Imported Book (${isbn})`,
          `D:/BBA Coursebook Images/highres/${isbn}.jpg`,
          `http://localhost:5000/covers_highres/${isbn}.jpg`,
        ]
      );
      console.log(`➕ Inserted new DB row for ${isbn}`);
    }
  }

  console.log("✅ Sync complete.");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
