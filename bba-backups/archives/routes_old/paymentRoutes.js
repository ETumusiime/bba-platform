import express from "express";
import { initiatePayment } from "../modules/payments/initiatePayment.js";
import { verifyPayment } from "../modules/payments/verifyPayment.js";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);

export default router;
