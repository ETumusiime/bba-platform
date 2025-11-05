// backend/modules/payments/routes.js
import { Router } from "express";
import { verifyPayment } from "./payments.controller.js";
const router = Router();
router.post("/verify", verifyPayment);
export default router;
