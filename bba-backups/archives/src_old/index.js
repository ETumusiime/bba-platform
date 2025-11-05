// backend/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/bookRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// ====== MIDDLEWARES ======
app.use(cors());
app.use(express.json());

// ====== ROUTES ======
app.use("/api/books", bookRoutes);
app.use("/api", householdRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ====== TEST ENDPOINT ======
app.get("/", (req, res) => {
  res.send("✅ BBA Backend API is running smoothly...");
});

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
