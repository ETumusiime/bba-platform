// -----------------------------
// 📘 BBA Backend Server (v3.2)
// -----------------------------
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import chokidar from "chokidar";
import pkg from "pg";
const { Pool } = pkg;

// ----------------------------------------------------
// 🧩 Express Setup
// ----------------------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 📂 Static Paths
// ----------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const coversPath = path.join("D:", "BBA Coursebook Images", "highres");
app.use("/covers_highres", express.static(coversPath));

// ----------------------------------------------------
// 🗄️ PostgreSQL Connection
// ----------------------------------------------------
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bba_db",
  password: "Alpha12345!!!!!",
  port: 5432,
});
const db = { query: (t, p) => pool.query(t, p) };

// ----------------------------------------------------
// 📘 Load Metadata
// ----------------------------------------------------
let metadata = {};
try {
  const data = fs.readFileSync(path.join(__dirname, "book_metadata.json"), "utf8");
  metadata = JSON.parse(data);
  console.log("📚 Loaded book metadata successfully.");
} catch {
  console.error("⚠️ Could not load book_metadata.json");
}

// ----------------------------------------------------
// 🧹 DELETE all books without matching cover image
// ----------------------------------------------------
app.post("/api/books/cleanup", async (req, res) => {
  try {
    const files = fs
      .readdirSync(coversPath)
      .filter((f) => f.match(/^\d+\.jpg$/))
      .map((f) => f.replace(".jpg", ""));

    const { rows } = await db.query("SELECT id, isbn FROM books");
    const validIsbns = new Set(files);

    let deleted = 0;
    for (const row of rows) {
      const clean = (row.isbn || "").replace(/[\s-]/g, "");
      if (!validIsbns.has(clean)) {
        await db.query("DELETE FROM books WHERE id = $1", [row.id]);
        deleted++;
      }
    }

    res.json({ status: "success", deleted });
  } catch (err) {
    console.error("❌ Error cleaning up:", err);
    res.status(500).json({ error: "Cleanup failed" });
  }
});

// ----------------------------------------------------
// 🔁 Re-Sync route
// ----------------------------------------------------
app.post("/api/books/resync", async (req, res) => {
  try {
    const files = fs.readdirSync(coversPath).filter((f) => f.endsWith(".jpg"));
    let updated = 0;

    for (const file of files) {
      const isbn = file.replace(/\.jpg$/, "");
      const coverUrl = `http://localhost:${PORT}/covers_highres/${file}`;
      const bookData = metadata[isbn];

      if (bookData) {
        await db.query(
          `INSERT INTO books (title, author, edition, isbn, format, published, cover_url)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (isbn) DO UPDATE SET
             title = EXCLUDED.title,
             author = EXCLUDED.author,
             edition = EXCLUDED.edition,
             format = EXCLUDED.format,
             published = EXCLUDED.published,
             cover_url = EXCLUDED.cover_url`,
          [
            bookData.title,
            bookData.author,
            bookData.edition,
            isbn,
            bookData.format,
            bookData.published,
            coverUrl,
          ]
        );
        updated++;
      }
    }

    res.json({ status: "success", updated });
  } catch (err) {
    console.error("❌ Error in resync:", err);
    res.status(500).json({ error: "Resync failed" });
  }
});

// ----------------------------------------------------
// 👁️ Watcher for new covers
// ----------------------------------------------------
const watcher = chokidar.watch(coversPath, { persistent: true, ignoreInitial: true });
watcher.on("add", async (filePath) => {
  const fileName = path.basename(filePath);
  const isbn = fileName.replace(/\.jpg$/, "");
  const bookData = metadata[isbn];
  const coverUrl = `http://localhost:${PORT}/covers_highres/${fileName}`;

  if (!bookData) {
    console.log(`⚠️ No metadata found for new image: ${fileName}`);
    return;
  }

  try {
    await db.query(
      `INSERT INTO books (title, author, edition, isbn, format, published, cover_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (isbn) DO UPDATE SET
         title = EXCLUDED.title,
         author = EXCLUDED.author,
         edition = EXCLUDED.edition,
         format = EXCLUDED.format,
         published = EXCLUDED.published,
         cover_url = EXCLUDED.cover_url`,
      [
        bookData.title,
        bookData.author,
        bookData.edition,
        isbn,
        bookData.format,
        bookData.published,
        coverUrl,
      ]
    );
    console.log(`✅ Auto-updated DB for new cover: ${isbn}`);
  } catch (err) {
    console.error("❌ Error updating DB:", err);
  }
});

console.log(`📁 Serving high-res covers from: ${coversPath}`);
console.log(`👁️ Watching for new covers in: ${coversPath}`);

// ----------------------------------------------------
// 📚 Fetch books with pagination + optional search
// ----------------------------------------------------
app.get("/api/books", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const q = req.query.q ? `%${req.query.q.toLowerCase()}%` : null;

    let booksQuery = `
      SELECT * FROM books 
      WHERE cover_url IS NOT NULL
    `;
    let countQuery = `
      SELECT COUNT(*) AS total FROM books
      WHERE cover_url IS NOT NULL
    `;
    const params = [];
    if (q) {
      booksQuery += `
        AND (LOWER(title) LIKE $${params.length + 1}
             OR LOWER(author) LIKE $${params.length + 1}
             OR LOWER(isbn) LIKE $${params.length + 1})`;
      countQuery += `
        AND (LOWER(title) LIKE $${params.length + 1}
             OR LOWER(author) LIKE $${params.length + 1}
             OR LOWER(isbn) LIKE $${params.length + 1})`;
      params.push(q);
    }
    booksQuery += ` ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const booksResult = await db.query(booksQuery, params);
    const countResult = await db.query(countQuery, q ? [q] : []);
    const total = parseInt(countResult.rows[0].total, 10);

    res.json({
      rows: booksResult.rows,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("❌ Error fetching books:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------------------------------
// 🚀 Start Server
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ BBA Backend running on http://localhost:${PORT}`);
});
