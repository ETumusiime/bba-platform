import pool from "../db.js";
import fs from "fs-extra";
import path from "path";
import { categoryMap } from "../utils/categoryMap.js";

/* -------------------------------------------------------------------------- */
/* 🧹 Helpers: Normalization utilities */
/* -------------------------------------------------------------------------- */
function normalizeCategory(str = "") {
  return str
    .replace(/Cambridge\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeSubject(str = "") {
  return str
    .toLowerCase()
    .replace(/maths|mathematical/gi, "mathematics")
    .replace(/&/g, "and") // ✅ Handles “&” vs “and”
    .replace(/\s+/g, "")
    .trim();
}

function normalizeYear(str = "") {
  return str.replace(/\s+/g, " ").trim().toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* ✅ GET /api/books (Intelligent fuzzy filters — category, year, subject, isbn) */
/* -------------------------------------------------------------------------- */
export const getBooks = async (req, res) => {
  try {
    const { category, year, subject, isbn } = req.query;
    const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

    let query = `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.edition,
        b.isbn,
        b.category,
        b.grade_year,
        b.subject,
        b.published_date,
        b.price_ugx,
        b.cover_url,
        cl.category_name
      FROM public.books b
      LEFT JOIN category_lookup cl ON b.category_id = cl.id
      WHERE 1=1
    `;
    const params = [];

    // ✅ ISBN flexible match
    if (isbn) {
      query += ` AND REPLACE(LOWER(b.isbn), '-', '') LIKE LOWER(REPLACE($${params.length + 1}, '-', ''))`;
      params.push(`%${isbn}%`);
    }

    // ✅ Category fuzzy match
    if (category) {
      const cleanCategory =
        categoryMap[category] || normalizeCategory(category);
      query += ` AND (
        LOWER(cl.category_name) LIKE LOWER($${params.length + 1})
        OR LOWER(b.category) LIKE LOWER($${params.length + 1})
      )`;
      params.push(`%${cleanCategory}%`);
    }

    // ✅ Year fuzzy match
    if (year) {
      query += ` AND (
        LOWER(b.grade_year) LIKE LOWER($${params.length + 1})
        OR LOWER(b.title) LIKE LOWER($${params.length + 1})
      )`;
      params.push(`%${normalizeYear(year)}%`);
    }

    // ✅ Subject fuzzy match
    if (subject) {
      const normalized = normalizeSubject(subject);
      query += ` AND (
        LOWER(REPLACE(b.subject, ' ', '')) LIKE LOWER(REPLACE($${params.length + 1}, ' ', ''))
        OR LOWER(b.title) LIKE LOWER($${params.length + 1})
      )`;
      params.push(`%${normalized}%`);
    }

    query += " ORDER BY b.title ASC";

    const { rows } = await pool.query(query, params);

    if (rows.length === 0)
      return res.status(404).json({ message: "No books found", results: [] });

    // 🧩 Normalize image URLs
    const results = rows.map((r) => {
      const fileName = r.cover_url ? path.basename(r.cover_url) : `${r.isbn}.jpg`;
      return {
        ...r,
        image_url: `${BASE_URL}/uploads/${fileName}`,
      };
    });

    res.json({ results });
  } catch (err) {
    console.error("❌ getBooks Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ GET /api/books/category/:category/year/:year/subject/:subject */
/* -------------------------------------------------------------------------- */
export const getBooksByFilter = async (req, res) => {
  try {
    const categoryRaw = decodeURIComponent(req.params.category || "").trim();
    const yearRaw = decodeURIComponent(req.params.year || "").trim();
    const subjectRaw = decodeURIComponent(req.params.subject || "").trim();

    const sql = `
      SELECT b.*, cl.category_name
      FROM books b
      JOIN category_lookup cl ON b.category_id = cl.id
      WHERE LOWER(cl.category_name) = LOWER($1)
        AND LOWER(b.grade_year) = LOWER($2)
        AND REPLACE(LOWER(b.subject), ' ', '') = REPLACE(LOWER($3), ' ', '')
      ORDER BY b.title ASC;
    `;

    const { rows } = await pool.query(sql, [
      normalizeCategory(categoryRaw),
      normalizeYear(yearRaw),
      normalizeSubject(subjectRaw),
    ]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching filtered books:", err);
    res.status(500).json({ error: "Failed to fetch filtered books" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🚫 SYNC DISABLED: Mallory CSV pipeline removed */
/* -------------------------------------------------------------------------- */
export const syncBooks = async (req, res) => {
  res.json({
    message:
      "🧩 Mallory sync disabled — using manual upload workflow. Upload new books manually via Admin panel.",
  });
};

/* -------------------------------------------------------------------------- */
/* ✅ GET /api/books/:isbn → Get full book + details */
/* -------------------------------------------------------------------------- */
export const getBookByISBN = async (req, res) => {
  try {
    const { isbn } = req.params;
    const cleanIsbn = isbn.trim();
    const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

    const bookQuery = `
      SELECT b.*, cl.category_name
      FROM books b
      LEFT JOIN category_lookup cl ON b.category_id = cl.id
      WHERE TRIM(b.isbn) = $1
      LIMIT 1;
    `;
    const bookResult = await pool.query(bookQuery, [cleanIsbn]);
    if (bookResult.rows.length === 0)
      return res.status(404).json({ message: "Book not found" });

    const book = bookResult.rows[0];

    const detailsQuery = `
      SELECT overview, features, contents
      FROM book_details
      WHERE TRIM(isbn) = $1
      LIMIT 1;
    `;
    const detailsResult = await pool.query(detailsQuery, [cleanIsbn]);
    const details = detailsResult.rows[0] || {};

    book.overview = details.overview || "";
    book.features = Array.isArray(details.features) ? details.features : [];
    book.contents = Array.isArray(details.contents) ? details.contents : [];

    // 🆕 Ensure valid image URL
    const fileName = book.cover_url
      ? path.basename(book.cover_url)
      : `${book.isbn}.jpg`;
    book.image_url = `${BASE_URL}/uploads/${fileName}`;

    res.json(book);
  } catch (err) {
    console.error("❌ Error fetching book by ISBN:", err);
    res.status(500).json({ message: "Server error while fetching book" });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ SEARCH: /api/books/search?q=<query> */
/* -------------------------------------------------------------------------- */
export const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

    if (!q || !q.trim())
      return res
        .status(400)
        .json({ message: "Search query required", results: [] });

    const rawQuery = q.trim();
    const normalizedISBN = rawQuery.replace(/[^0-9Xx]/g, "");

    const sql = `
      SELECT b.*, d.overview, d.features, d.contents, cl.category_name
      FROM books b
      LEFT JOIN book_details d ON TRIM(b.isbn) = TRIM(d.isbn)
      LEFT JOIN category_lookup cl ON b.category_id = cl.id
      WHERE
        regexp_replace(b.isbn, E'[\\s\\r\\n\\t-]', '', 'g') = $1 OR
        b.isbn = $2 OR
        b.title ILIKE $3 OR
        b.subject ILIKE $3 OR
        cl.category_name ILIKE $3
      ORDER BY b.title ASC
      LIMIT 20;
    `;

    const params = [normalizedISBN, rawQuery, `%${rawQuery}%`];
    const { rows } = await pool.query(sql, params);

    if (rows.length === 0)
      return res
        .status(404)
        .json({ message: "No matching books found", results: [] });

    const results = rows.map((r) => {
      const fileName = r.cover_url ? path.basename(r.cover_url) : `${r.isbn}.jpg`;
      return {
        ...r,
        image_url: `${BASE_URL}/uploads/${fileName}`,
      };
    });

    res.json({ results });
  } catch (err) {
    console.error("❌ Error searching books:", err);
    res
      .status(500)
      .json({ error: "Server error while searching books", results: [] });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ FIXED: NAVIGATION PREVIEW (now returns absolute image URLs) */
/* -------------------------------------------------------------------------- */
export const getBookPreview = async (req, res) => {
  try {
    const { category, year, subject } = req.query;
    const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

    if (!category || !year || !subject)
      return res.status(400).json({ message: "Missing parameters" });

    const sql = `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.edition,
        b.subject,
        b.grade_year,
        b.category,
        b.price_ugx AS price,
        b.isbn,
        b.cover_url,
        COALESCE(cl.category_name, b.category) AS category_name
      FROM books b
      LEFT JOIN category_lookup cl ON b.category_id = cl.id
      WHERE (
          LOWER(cl.category_name) LIKE LOWER($1)
          OR LOWER(b.category) LIKE LOWER($1)
        )
        AND LOWER(b.grade_year) LIKE LOWER($2)
        AND LOWER(REPLACE(b.subject, ' ', '')) LIKE LOWER(REPLACE($3, ' ', ''))
      ORDER BY b.title ASC
      LIMIT 1;
    `;

    const { rows } = await pool.query(sql, [
      `%${category}%`,
      `%${year}%`,
      `%${subject}%`,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Book not found" });

    const book = rows[0];
    const fileName = book.cover_url
      ? path.basename(book.cover_url)
      : `${book.isbn}.jpg`;
    book.image_url = `${BASE_URL}/uploads/${fileName}`;

    res.json(book);
  } catch (err) {
    console.error("❌ Error fetching book preview:", err);
    res.status(500).json({ message: "Server error while fetching book preview" });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ NAVIGATION DATA */
/* -------------------------------------------------------------------------- */
export const getNavigationData = async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT cl.category_name, b.grade_year, b.subject
      FROM books b
      JOIN category_lookup cl ON b.category_id = cl.id
      WHERE cl.category_name IS NOT NULL
        AND b.grade_year IS NOT NULL
        AND b.subject IS NOT NULL;
    `;
    const { rows } = await pool.query(sql);

    const data = {};
    for (const row of rows) {
      const cat = row.category_name.trim();
      const yr = row.grade_year.trim();
      const sub = row.subject.trim();
      if (!data[cat]) data[cat] = {};
      if (!data[cat][yr]) data[cat][yr] = new Set();
      data[cat][yr].add(sub);
    }

    const structured = {};
    for (const cat of Object.keys(data)) {
      structured[cat] = {};
      for (const yr of Object.keys(data[cat])) {
        structured[cat][yr] = Array.from(data[cat][yr]).sort();
      }
    }

    res.json(structured);
  } catch (err) {
    console.error("❌ Error building navigation data:", err);
    res.status(500).json({ error: "Failed to load navigation data" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🆕 ADMIN: UPLOAD NEW BOOK */
/* -------------------------------------------------------------------------- */
export const uploadBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      grade_year,
      subject,
      edition,
      date_published,
      price,
    } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !author || !isbn || !category)
      return res
        .status(400)
        .json({ message: "Missing required fields (title, author, isbn, category)" });

    // ✅ Prevent duplicate ISBN uploads
    const duplicate = await pool.query("SELECT 1 FROM books WHERE isbn = $1", [isbn]);
    if (duplicate.rowCount > 0)
      return res
        .status(400)
        .json({ message: "⚠️ A book with this ISBN already exists." });

    const fullDate =
      date_published && /^\d{4}-\d{2}$/.test(date_published)
        ? `${date_published}-01`
        : date_published || null;

    await pool.query(
      `
      INSERT INTO books 
        (title, author, isbn, category, grade_year, subject, edition, published_date, price_ugx, cover_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);
      `,
      [
        title,
        author,
        isbn,
        category,
        grade_year,
        subject,
        edition || null,
        fullDate,
        price || null,
        image,
      ]
    );

    res.json({ message: "✅ Book uploaded successfully" });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).json({ message: "Failed to upload book" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🗑️ DELETE BOOK */
/* -------------------------------------------------------------------------- */
export const deleteBook = async (req, res) => {
  try {
    const { isbn } = req.params;
    const result = await pool.query("DELETE FROM books WHERE isbn = $1", [isbn]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Book not found" });

    res.json({ message: "🗑️ Book deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ message: "Failed to delete book" });
  }
};
