// backend/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

// === ROUTES ===
// import locationRoutes from "./routes/locationRoutes.js";
// import authRoutes from "./routes/authRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json());

// === ROUTE MOUNTING ===
// app.use("/api/locations", locationRoutes);
// app.use("/api/auth", authRoutes);
app.use("/api", householdRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// === TEST ENDPOINT ===
app.get("/", (req, res) => {
  res.send("Registration System API running...");
});

// === SERVER START ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
