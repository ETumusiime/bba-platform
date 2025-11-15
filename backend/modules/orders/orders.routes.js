// backend/modules/orders/orders.routes.js
import express from "express";
import {
  createOrder,
  getOrder,
  getOrderByTagHandler,
  initOrderForFlutterwave,
  updateOrderStatusFromFlutterwave,
} from "./orders.controller.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🩺 Health check                                                            */
/* -------------------------------------------------------------------------- */
router.get("/", (req, res) => res.send("📦 Orders API ready"));

/* -------------------------------------------------------------------------- */
/* 🟢 (Legacy) Create order – NOT used by Flutterwave button                 */
/* -------------------------------------------------------------------------- */
router.post("/", createOrder);

/* -------------------------------------------------------------------------- */
/* 🟢 Step 1 — Initialize Order for Flutterwave                              */
/* -------------------------------------------------------------------------- */
router.post("/init", initOrderForFlutterwave);

/* -------------------------------------------------------------------------- */
/* 🟢 Step 2 — Update Status After Payment                                    */
/* -------------------------------------------------------------------------- */
router.post("/update-status", updateOrderStatusFromFlutterwave);

/* -------------------------------------------------------------------------- */
/* 🟢 Fetch order by human-readable tag (orderTag)                            */
/* -------------------------------------------------------------------------- */
router.get("/by-tag/:orderTag", getOrderByTagHandler);

/* -------------------------------------------------------------------------- */
/* 🟢 Fetch order by internal ID                                              */
/* -------------------------------------------------------------------------- */
router.get("/:id", getOrder);

export default router;
