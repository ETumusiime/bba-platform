console.log("🚀 Running FROM backend/server.js (main entrypoint)");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "./db.js";

/* -------------------------------------------------------------------------- */
/* ✅ EXISTING ROUTER IMPORTS */
/* -------------------------------------------------------------------------- */
import booksRouter from "./routes/booksRoutes.js";
import authRouter from "./routes/authRoutes.js"; 
import adminBooksRouter from "./routes/adminBooksRoutes.js";
import adminAuthRouter from "./routes/adminAuthRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { testSendGrid } from "./modules/notifications/testEmail.js";
import studentBooksRoutes from "./routes/studentBooks.js";
import studentProxyRoutes from "./routes/studentProxyRoutes.js";
import cambridgeRoutes from "./routes/cambridgeRoutes.js";

import parentRouter from "./routes/parentRoutes.js"; 
import parentChildrenRoutes from "./routes/parentChildrenRoutes.js"; 
import studentAuthRoutes from "./routes/studentAuthRoutes.js";

/* -------------------------------------------------------------------------- */
/* ✅ NEW (PRISMA) ROUTERS — Add these */
/* -------------------------------------------------------------------------- */
import ordersRoutes from "./modules/orders/orders.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";

/* -------------------------------------------------------------------------- */
/* ENV + APP */
/* -------------------------------------------------------------------------- */
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

/* -------------------------------------------------------------------------- */
/* STATIC FILES */
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
}

// 3️⃣ High-res covers
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
}

/* -------------------------------------------------------------------------- */
/* ROUTES */
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => res.send("📚 BBA Backend API is running"));

app.use("/api/books", booksRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/books", adminBooksRouter);

app.use("/api/cart", cartRoutes);

/* -------------------------------------------------------------------------- */
/* ✅ NEW: Prisma orders + payments (critical!) */
/* -------------------------------------------------------------------------- */
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);

app.use("/api/parent", parentRouter);
app.use("/api/parent/children", parentChildrenRoutes);
app.use("/api/student", studentAuthRoutes);
app.use("/api/student/books", studentBooksRoutes);
app.use("/api/student/books", studentProxyRoutes);
app.use("/api/cambridge", cambridgeRoutes);

// Emails (dev only)
if (process.env.NODE_ENV !== "production") {
  app.get("/api/test-email", testSendGrid);
}

/* -------------------------------------------------------------------------- */
/* PG TEST */
/* -------------------------------------------------------------------------- */
pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection failed:", err.message));

/* -------------------------------------------------------------------------- */
/* START SERVER */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Uploaded covers: http://localhost:${PORT}/uploads/filename.jpg`);
});
