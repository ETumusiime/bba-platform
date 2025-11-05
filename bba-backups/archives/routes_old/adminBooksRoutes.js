import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import pool from "../db.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 📁 Base path for all book cover images                                     */
/* -------------------------------------------------------------------------- */
const BASE_FOLDER = "D:/BBA Coursebook Images/highres";

/* -------------------------------------------------------------------------- */
/* 🧩 Multer setup (store uploaded image by category)                         */
/* -------------------------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const category = req.body.category?.trim() || "Uncategorized";
      const folder = path.join(BASE_FOLDER, category);
      await fs.ensureDir(folder);
      cb(null, folder);
    } catch (err) {
      console.error("❌ Multer destination error:", err);
      cb(err, BASE_FOLDER);
    }
  },
  filename: (req, file, cb) => {
    const isbn = req.body.isbn?.trim() || Date.now();
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${isbn}${ext}`);
  },
});

const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/* 🟢  POST /api/admin/books/upload — Upload or Update Book Info + Image       */
/* -------------------------------------------------------------------------- */
router.post("/upload", upload.single("cover"), async (req, res) => {
  try {
    const {
      isbn,
      title,
      subject,
      edition,
      year,
      category,
      overview,
      features,
      contents,
    } = req.body;

    if (!isbn || !title || !subject || !category || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const imageUrl = `/covers_highres/${encodeURIComponent(category)}/${isbn}.jpg`;

    console.log("📘 Upload request:", { isbn, title, category, imageUrl });

    // 🧠 Upsert main book record
    const existing = await pool.query("SELECT id FROM books WHERE isbn = $1", [isbn]);

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE books
         SET title=$1, subject=$2, edition=$3, year=$4, category=$5, cover_url=$6, "updatedAt"=NOW()
         WHERE isbn=$7`,
        [title, subject, edition, year, category, imageUrl, isbn]
      );
    } else {
      await pool.query(
        `INSERT INTO books (isbn, title, subject, edition, year, category, cover_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [isbn, title, subject, edition, year, category, imageUrl]
      );
    }

    // 🧩 Prepare safe arrays for features & contents
    const featuresArr = features
      ? features.split(",").map((f) => f.trim())
      : [];
    const contentsArr = contents
      ? contents.split(",").map((c) => c.trim())
      : [];

    // 🧠 Upsert book details
    const detailExists = await pool.query("SELECT id FROM book_details WHERE isbn = $1", [isbn]);

    if (detailExists.rows.length > 0) {
      await pool.query(
        `UPDATE book_details
         SET overview=$1, features=$2, contents=$3
         WHERE isbn=$4`,
        [overview || "", featuresArr, contentsArr, isbn]
      );
    } else {
      await pool.query(
        `INSERT INTO book_details (isbn, overview, features, contents)
         VALUES ($1,$2,$3,$4)`,
        [isbn, overview || "", featuresArr, contentsArr]
      );
    }

    res.json({ message: "✅ Book uploaded successfully", isbn, imageUrl });
  } catch (err) {
    console.error("❌ Upload error:", err.message, err.stack);
    res.status(500).json({ message: "Failed to upload book", error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔴  DELETE /api/admin/books/:isbn — Delete Book + Metadata                  */
/* -------------------------------------------------------------------------- */
router.delete("/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params;

    // Delete from database
    await pool.query("DELETE FROM books WHERE isbn = $1", [isbn]);
    await pool.query("DELETE FROM book_details WHERE isbn = $1", [isbn]);

    // Delete image file if exists
    const folders = await fs.readdir(BASE_FOLDER);
    for (const folder of folders) {
      const filePath = path.join(BASE_FOLDER, folder, `${isbn}.jpg`);
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        console.log(`🗑️ Deleted cover: ${filePath}`);
        break;
      }
    }

    res.json({ message: "✅ Book deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message, err.stack);
    res.status(500).json({ message: "Failed to delete book", error: err.message });
  }
});

export default router;
