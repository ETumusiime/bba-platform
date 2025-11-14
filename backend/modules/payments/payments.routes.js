// backend/modules/payments/payments.routes.js
import express from "express";
import { verifyPayment, paymentsHealth } from "./payments.controller.js";

const router = express.Router();

// Health check
router.get("/", paymentsHealth);

// POST /api/payments/verify
router.post("/verify", verifyPayment);

export default router;
