import express from "express";
import { createOrder } from "./orders.controller.js";

const router = express.Router();

// 📦 POST /api/orders/create
router.post("/create", createOrder);

// 🧪 simple health check
router.get("/", (req, res) => res.send("📦 Orders API ready"));

export default router;
