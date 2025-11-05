import express from "express";
import path from "path";
import fs from "fs-extra";
import multer from "multer";
import {
  getBooks,
  getBooksByFilter,
  syncBooks,
  getBookByISBN,
  searchBooks,
  getBookPreview,
  getNavigationData,
  uploadBook,
  deleteBook,
} from "../controllers/booksController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* ⚙️ Multer Setup — For Uploading Book Cover Images                          */
/* -------------------------------------------------------------------------- */

// ✅ Save uploaded files directly to frontend/public/uploads for visibility
const uploadDir = path.join(process.cwd(), "../frontend/public/uploads");
fs.ensureDirSync(uploadDir);
console.log("🖼️ Book uploads directory:", uploadDir);

// ⚙️ Configure storage engine (now uses ISBN-based naming)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // ✅ Use ISBN-based naming if available in form data
    const isbn = req.body?.isbn?.trim();
    if (isbn) {
      cb(null, `${isbn}.jpg`);
    } else {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  },
});

// ✅ Initialize multer middleware
const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/* ✅ BOOKS ROUTES (Public + Admin)                                           */
/* -------------------------------------------------------------------------- */

// 🔍 Get all books (optionally filter by ?category=&year=&subject=&isbn=)
router.get("/", getBooks);

// 🧭 Dynamic navigation data (categories → years → subjects)
router.get("/navigation-data", getNavigationData);

// 🎯 Parent-facing route: fetch one book preview by category/year/subject
router.get("/preview", getBookPreview);

// 🔎 Search by title / subject / ISBN / category
router.get("/search", searchBooks);

// ⚙️ Admin: Smart Sync (merge local images with Mallory CSV)
router.get("/sync", syncBooks);

// 📚 Filter chain: category → year → subject
router.get("/category/:category/year/:year/subject/:subject", getBooksByFilter);

// 📘 Single book by ISBN (keep last to avoid catching other routes)
router.get("/:isbn", getBookByISBN);

/* -------------------------------------------------------------------------- */
/* ✅ ADMIN ROUTES — Upload / Delete Books                                    */
/* -------------------------------------------------------------------------- */

// 🆕 Upload new book (with file)
router.post("/upload", upload.single("file"), uploadBook);

// ❌ Delete book by ISBN
router.delete("/:isbn", deleteBook);

/* -------------------------------------------------------------------------- */
/* ✅ EXPORT ROUTER                                                           */
/* -------------------------------------------------------------------------- */
export default router;
