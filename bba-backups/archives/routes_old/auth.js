import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

// 🧩 REGISTER — new parent account with 7-day trial
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "PARENT",
        trialStartDate: now,
        trialEndDate: trialEnd,
        subscriptionStatus: "trial",
      },
    });

    res.status(201).json({
      message: "Parent registered successfully",
      trial_start: now,
      trial_end: trialEnd,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: error.message, details: error });
  }
});

// 🔐 LOGIN — returns JWT token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { parent_id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      trial_end_date: user.trialEndDate,
      subscription_status: user.subscriptionStatus,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
