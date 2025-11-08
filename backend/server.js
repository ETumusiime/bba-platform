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
import authRouter from "./routes/authRoutes.js"; // ✅ Parent login/register routes
import adminBooksRouter from "./routes/adminBooksRoutes.js";
import adminAuthRouter from "./routes/adminAuthRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentsRoutes from "./modules/payments/routes.js";
import { testSendGrid } from "./modules/notifications/testEmail.js";
import studentBooksRoutes from "./routes/studentBooks.js";
import childAuthRoutes from "./routes/childAuthRoutes.js";
import studentProxyRoutes from "./routes/studentProxyRoutes.js";
import cambridgeRoutes from "./routes/cambridgeRoutes.js";
import parentRouter from "./routes/parent.js"; // ✅ Parent dashboard + student registration

/* -------------------------------------------------------------------------- */
/* ✅ ENV + APP INIT */
/* -------------------------------------------------------------------------- */
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

// 1️⃣ Backend uploads
const backendUploadsPath = path.join(process.cwd(), "uploads");
if (fs.existsSync(backendUploadsPath)) {
  console.log("🗂️ Serving backend uploads from:", backendUploadsPath);
  app.use(
    "/uploads",
    express.static(backendUploadsPath, {
      setHeaders: (res) => res.setHeader("Access-Control-Allow-Origin", "*"),
    })
  );
} else {
  console.warn("⚠️ Backend uploads folder not found:", backendUploadsPath);
}

// 2️⃣ Frontend public uploads
const frontendUploadsPath = path.join(__dirname, "../frontend/public/uploads");
if (fs.existsSync(frontendUploadsPath)) {
  console.log("🖼️ Serving uploaded book covers from:", frontendUploadsPath);
  app.use(
    "/uploads",
    express.static(frontendUploadsPath, {
      fallthrough: true,
      setHeaders: (res) => res.setHeader("Access-Control-Allow-Origin", "*"),
    })
  );
} else {
  console.warn("⚠️ frontend/public/uploads not found:", frontendUploadsPath);
}

// 3️⃣ Legacy folder
const legacyUploadsPath = path.join(__dirname, "uploads");
if (fs.existsSync(legacyUploadsPath)) {
  app.use("/uploads_legacy", express.static(legacyUploadsPath));
}

// 4️⃣ High-res covers (local folder)
const coversPath = path.normalize("D:/BBA Coursebook Images/highres");
if (fs.existsSync(coversPath)) {
  console.log("🖼️ Serving high-res covers from:", coversPath);
  app.use(
    "/covers_highres",
    express.static(coversPath, {
      fallthrough: true,
      setHeaders: (res) => res.setHeader("Access-Control-Allow-Origin", "*"),
    })
  );

  // serve high-res images dynamically
  app.get("/covers_highres/:category/:isbn", (req, res) => {
    const { category, isbn } = req.params;
    const folder = path.join(coversPath, decodeURIComponent(category));
    const extensions = [".jpg", ".jpeg", ".png"];
    for (const ext of extensions) {
      const filePath = path.join(folder, `${isbn}${ext}`);
      if (fs.existsSync(filePath)) return res.sendFile(filePath);
    }
    console.warn("⚠️ Image not found for:", isbn, "in", category);
    res.status(404).send("Image not found");
  });
} else {
  console.warn("⚠️ Covers folder not found:", coversPath);
}

/* -------------------------------------------------------------------------- */
/* ✅ ROUTES */
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => res.send("📚 BBA Backend API is running"));

// 📘 Main Book Routes
app.use("/api/books", booksRouter);

// 🔐 Parent authentication (✅ newly fixed mount)
app.use("/api/auth", authRouter);

// 🔑 Admin authentication
app.use("/api/admin/auth", adminAuthRouter);

// 🧩 Admin book management
app.use("/api/admin/books", adminBooksRouter);

// 🛒 Cart + Payments
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentsRoutes);

// 👦 Child authentication + student routes
app.use("/api/child/auth", childAuthRoutes);
app.use("/api/student/books", studentBooksRoutes);
app.use("/api/student/books", studentProxyRoutes);

// 🏫 Cambridge Validation
app.use("/api/cambridge", cambridgeRoutes);

// 👨‍👩‍👧 Parent-specific routes (Manage Students, Register Student, etc.)
app.use("/api/parent", parentRouter);

// ✉️ Test Email
if (process.env.NODE_ENV !== "production") {
  app.get("/api/test-email", testSendGrid);
}

// 🧰 Debug route
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
  .catch((err) =>
    console.error("❌ PostgreSQL connection failed:", err.message)
  );

/* -------------------------------------------------------------------------- */
/* ✅ START SERVER */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Uploaded covers: http://localhost:${PORT}/uploads/filename.jpg`);
});
