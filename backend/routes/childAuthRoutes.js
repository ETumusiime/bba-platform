// backend/routes/childAuthRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

/**
 * POST /api/child/auth/login
 * Student (child user) login
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const child = await prisma.childUser.findUnique({ where: { username } });
    if (!child) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isValid = await bcrypt.compare(password, child.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: child.id, role: "CHILD" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("bba_child_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🎫 Issued child token:", token);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      child: {
        id: child.id,
        username: child.username,
        firstName: child.firstName,
        lastName: child.lastName,
      },
    });
  } catch (err) {
    console.error("❌ Error in /api/child/auth/login:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
