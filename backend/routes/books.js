import express from "express";
import {
  getBooks,
  getBooksByFilter,
  syncBooks,
  getBookByISBN,   // ✅ Correct import name
  searchBooks,
} from "../controllers/booksController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* ✅ BASE ROUTES */
/* -------------------------------------------------------------------------- */

// 1️⃣ List / filter via query params
router.get("/", getBooks);

// 2️⃣ Filter by category → year → subject
router.get("/category/:category/year/:year/subject/:subject", getBooksByFilter);

// 3️⃣ Smart Sync: merge CSV + images
router.get("/sync", syncBooks);

// 4️⃣ Search by ISBN (Parent-facing search bar)
router.get("/search", searchBooks);

// 5️⃣ Get full book details (merged from books + book_details)
router.get("/:isbn", getBookByISBN); // ✅ Must remain last to avoid conflict

export default router;
