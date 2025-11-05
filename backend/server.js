// backend/server.js
console.log("🚀 Running FROM backend/server.js (main entrypoint)");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "./db.js";

/* -------------------------------------------------------------------------- */
/* ✅ ROUTER IMPORTS */
/* -------------------------------------------------------------------------- */
import booksRouter from "./routes/booksRoutes.js";
import authRouter from "./routes/authRoutes.js";
import adminBooksRouter from "./routes/adminBooksRoutes.js"; // ✅ Admin books (upload/delete)
import adminAuthRouter from "./routes/adminAuthRoutes.js";   // ✅ Admin login routes
import cartRoutes from "./routes/cartRoutes.js";             // 🛒 Add-to-Cart routes
import paymentsRoutes from "./modules/payments/routes.js";   // 💳 Flutterwave Payments
import { testSendGrid } from "./modules/notifications/testEmail.js"; // ✉️ Test SendGrid route

dotenv.config();

const app = express();

/* -------------------------------------------------------------------------- */
/* ✅ BASIC MIDDLEWARE */
/* -------------------------------------------------------------------------- */
app.use(cors());
app.use(express.json());

/* -------------------------------------------------------------------------- */
/* ✅ STATIC FILE SERVING */
/* -------------------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1️⃣ Primary backend uploads folder
 */
const backendUploadsPath = path.join(process.cwd(), "uploads");
if (fs.existsSync(backendUploadsPath)) {
  console.log("🗂️ Serving backend uploads from:", backendUploadsPath);
  app.use(
    "/uploads",
    express.static(backendUploadsPath, {
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
      },
    })
  );
} else {
  console.warn("⚠️ Backend uploads folder not found:", backendUploadsPath);
}

/**
 * 2️⃣ Also serve images stored in frontend/public/uploads
 */
const frontendUploadsPath = path.join(__dirname, "../frontend/public/uploads");
if (fs.existsSync(frontendUploadsPath)) {
  console.log("🖼️ Serving uploaded book covers from:", frontendUploadsPath);
  app.use(
    "/uploads",
    express.static(frontendUploadsPath, {
      fallthrough: true,
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
      },
    })
  );
} else {
  console.warn("⚠️ frontend/public/uploads not found:", frontendUploadsPath);
}

/**
 * 3️⃣ Legacy compatibility — backend/uploads_legacy path
 */
const legacyUploadsPath = path.join(__dirname, "uploads");
if (fs.existsSync(legacyUploadsPath)) {
  app.use("/uploads_legacy", express.static(legacyUploadsPath));
}

/**
 * 4️⃣ Serve high-resolution local images from D: drive
 */
const coversPath = path.normalize("D:/BBA Coursebook Images/highres");

if (fs.existsSync(coversPath)) {
  console.log("🖼️ Serving high-res covers from:", coversPath);

  app.use(
    "/covers_highres",
    express.static(coversPath, {
      fallthrough: true,
      setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
      },
    })
  );

  app.get("/covers_highres/:category/:isbn", (req, res) => {
    const { category, isbn } = req.params;
    const decodedCategory = decodeURIComponent(category);
    const folder = path.join(coversPath, decodedCategory);

    const jpgPath = path.join(folder, `${isbn}.jpg`);
    const jpegPath = path.join(folder, `${isbn}.jpeg`);
    const pngPath = path.join(folder, `${isbn}.png`);

    if (fs.existsSync(jpgPath)) return res.sendFile(jpgPath);
    if (fs.existsSync(jpegPath)) return res.sendFile(jpegPath);
    if (fs.existsSync(pngPath)) return res.sendFile(pngPath);

    console.warn("⚠️ Image not found for:", isbn, "in", decodedCategory);
    res.status(404).send("Image not found");
  });
} else {
  console.warn("⚠️ Covers folder not found:", coversPath);
}

/* -------------------------------------------------------------------------- */
/* ✅ ROUTES */
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => res.send("📚 BBA Backend API is running"));

// 📘 Main book routes (public)
app.use("/api/books", booksRouter);

// 🔐 Parent authentication routes
app.use("/api/auth", authRouter);

// 🔑 Admin authentication route
app.use("/api/admin/auth", adminAuthRouter);

// 🧩 Admin-only book management routes (upload + delete)
app.use("/api/admin/books", adminBooksRouter);

// 🛒 Cart routes (new)
app.use("/api/cart", cartRoutes);

// 💳 Payments (Flutterwave Inline & Verification)
app.use("/api/payments", paymentsRoutes);

// ✉️ SendGrid test route
app.get("/api/test-email", testSendGrid);

// 🧰 Debug route — check visible files in one category
app.get("/api/debug/covers", (req, res) => {
  const folder = path.join(coversPath, "Upper Secondary");
  try {
    const files = fs.readdirSync(folder);
    res.json({ path: folder, count: files.length, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ DATABASE CONNECTION TEST */
/* -------------------------------------------------------------------------- */
pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection failed:", err.message));

/* -------------------------------------------------------------------------- */
/* ✅ START SERVER */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `🌐 Uploaded covers accessible at: http://localhost:${PORT}/uploads/filename.jpg`
  );
});
