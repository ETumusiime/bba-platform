console.log("🚀 Running FROM backend/server.js (main entrypoint)");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "./db.js";

/* -------------------------------------------------------------------------- */
/* ROUTER IMPORTS */
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
import studentAuthRoutes from "./routes/studentAuthRoutes.js";

/* NEW — PRISMA MODULE ROUTES */
import ordersRoutes from "./modules/orders/orders.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";

/* NEW — PARENT → STUDENTS (Prisma Student model) */
import parentStudentsRoutes from "./routes/parentStudentsRoutes.js";

/* NEW — ADMIN ASSIGN ACCESS CODES */
import adminStudentBookRoutes from "./routes/adminStudentBookRoutes.js";

/* NEW — ADMIN DASHBOARD METRICS */
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";

/* NEW — ADMIN PARENTS MANAGEMENT */
import adminParentsRoutes from "./routes/adminParentsRoutes.js";

/* NEW — ADMIN STUDENTS MANAGEMENT */
import adminStudentsRoutes from "./routes/adminStudentsRoutes.js";

/* ✅ NEW — ADMIN ORDERS MODULE */
import adminOrdersRoutes from "./routes/adminOrdersRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

/* -------------------------------------------------------------------------- */
/* STATIC FILES */
/* -------------------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend uploads
const backendUploadsPath = path.join(process.cwd(), "uploads");
if (fs.existsSync(backendUploadsPath)) {
  console.log("🗂️ Serving backend uploads from:", backendUploadsPath);
  app.use("/uploads", express.static(backendUploadsPath));
}

// Frontend uploads (book covers)
const frontendUploadsPath = path.join(__dirname, "../frontend/public/uploads");
if (fs.existsSync(frontendUploadsPath)) {
  console.log("🖼️ Serving uploaded book covers from:", frontendUploadsPath);
  app.use("/uploads", express.static(frontendUploadsPath));
}

// High-res covers
const coversPath = path.normalize("D:/BBA Coursebook Images/highres");
if (fs.existsSync(coversPath)) {
  console.log("🖼️ Serving high-res covers from:", coversPath);
  app.use("/covers_highres", express.static(coversPath));
}

/* -------------------------------------------------------------------------- */
/* API ROUTES */
/* -------------------------------------------------------------------------- */

app.get("/", (req, res) => res.send("📚 BBA Backend API is running"));

/* Books & Admin */
app.use("/api/books", booksRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/books", adminBooksRouter);

/* NEW — ADMIN DASHBOARD (metrics + activity) */
app.use("/api/admin/dashboard", adminDashboardRoutes);

/* NEW — ADMIN ASSIGN ACCESS CODES */
app.use("/api/admin/student-books", adminStudentBookRoutes);

/* NEW — ADMIN PARENTS MANAGEMENT */
app.use("/api/admin/parents", adminParentsRoutes);

/* NEW — ADMIN STUDENTS MANAGEMENT */
app.use("/api/admin/students", adminStudentsRoutes);

/* ✅ NEW — ADMIN ORDERS MANAGEMENT */
app.use("/api/admin/orders", adminOrdersRoutes);

/* Cart */
app.use("/api/cart", cartRoutes);

/* Orders & Payments (Prisma) */
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);

/* Parent account routes */
app.use("/api/parent", parentRouter);

/* NEW — Parent → Students (Prisma Student model) */
app.use("/api/parent/students", parentStudentsRoutes);

/* Student login + book fetching */
app.use("/api/student", studentAuthRoutes);
app.use("/api/student/books", studentBooksRoutes);
app.use("/api/student/books", studentProxyRoutes);

/* Cambridge Online */
app.use("/api/cambridge", cambridgeRoutes);

/* Dev Email Endpoint */
if (process.env.NODE_ENV !== "production") {
  app.get("/api/test-email", testSendGrid);
}

/* -------------------------------------------------------------------------- */
/* POSTGRES CONNECTION TEST */
/* -------------------------------------------------------------------------- */
pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) =>
    console.error("❌ PostgreSQL connection failed:", err.message)
  );

/* -------------------------------------------------------------------------- */
/* START SERVER */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `🌐 Uploaded covers: http://localhost:${PORT}/uploads/filename.jpg`
  );
});
