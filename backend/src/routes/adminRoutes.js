// backend/src/routes/adminRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// --- TEMP: Hardcoded admin for MVP ---
const adminUser = {
  email: "admin@bba.com",
  passwordHash: bcrypt.hashSync("password123", 10), // change later
};

// === POST /api/admin/login ===
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== adminUser.email) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const validPassword = bcrypt.compareSync(password, adminUser.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

export default router;
