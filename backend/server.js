import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import parentRoutes from "./routes/parents.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("BBA Backend API is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parents", parentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
