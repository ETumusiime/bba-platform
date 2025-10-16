import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const prisma = new PrismaClient();
const router = express.Router();

// ---------- Multer config for CSV uploads ----------
const upload = multer({ dest: "uploads/" });

// ---------- Helper: get cover image by ISBN ----------
const coverFromISBN = (isbn) =>
  isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null;

// ---------- POST /api/books  (create a single book) ----------
router.post("/", async (req, res) => {
  try {
    const { title, author, subject, code, edition, isbn, markup, price } = req.body;

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        subject,
        code,
        edition,
        isbn,
        markup: markup ? parseFloat(markup) : 0,
        price: price ? parseFloat(price) : null,
      },
    });

    res.json({ ...newBook, coverUrl: coverFromISBN(newBook.isbn) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- GET /api/books (list/search with pagination + sorting) ----------
router.get("/", async (req, res) => {
  try {
    const {
      q,
      isbn,
      page = 1,
      limit = 10,
      sortBy = "updatedAt",
      order = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = isbn
      ? { isbn }
      : q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const totalCount = await prisma.book.count({ where });

    const books = await prisma.book.findMany({
      where,
      orderBy: { [sortBy]: order.toLowerCase() === "asc" ? "asc" : "desc" },
      skip,
      take: parseInt(limit),
    });

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      books: books.map((b) => ({ ...b, coverUrl: coverFromISBN(b.isbn) })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- POST /api/books/import  (bulk CSV upload) ----------
// Expected CSV headers: Title,Subject,Code,Edition,ISBN,Markup,Price,Author
router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file?.path) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      try {
        let createdOrUpdated = 0;

        for (const r of results) {
          const title = (r.Title ?? "").trim();
          const subject = (r.Subject ?? "").trim();
          const code = (r.Code ?? "").trim();
          const edition = (r.Edition ?? "").trim();
          const isbn = (r.ISBN ?? "").trim();
          const author = (r.Author ?? "").trim();
          const markup = r.Markup ? parseFloat(r.Markup) : 0;
          const price = r.Price ? parseFloat(r.Price) : null;

          if (!title) continue; // skip empty rows

          if (isbn) {
            await prisma.book.upsert({
              where: { isbn },
              update: { title, author, subject, code, edition, markup, price },
              create: { title, author, subject, code, edition, isbn, markup, price },
            });
            createdOrUpdated++;
          } else {
            const existing = await prisma.book.findFirst({
              where: { title, edition },
            });
            if (existing) {
              await prisma.book.update({
                where: { id: existing.id },
                data: { author, subject, code, markup, price },
              });
            } else {
              await prisma.book.create({
                data: { title, author, subject, code, edition, isbn: null, markup, price },
              });
            }
            createdOrUpdated++;
          }
        }

        // cleanup uploaded file
        fs.unlink(req.file.path, () => {});

        res.json({
          message: "Import completed",
          rowsProcessed: results.length,
          createdOrUpdated,
        });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    .on("error", (err) => {
      res.status(500).json({ error: err.message });
    });
});

// ---------- PUT /api/books/:id (update a book) ----------
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, author, subject, code, edition, isbn, markup, price } = req.body;

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        subject,
        code,
        edition,
        isbn,
        markup: markup ? parseFloat(markup) : 0,
        price: price ? parseFloat(price) : null,
      },
    });

    res.json({ message: "Book updated successfully", book: updated });
  } catch (err) {
    if (err.code === "P2025") {
      // Prisma record-not-found error
      res.status(404).json({ error: "Book not found" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ---------- DELETE /api/books/:id (delete a book) ----------
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.book.delete({ where: { id } });
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Book not found" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
