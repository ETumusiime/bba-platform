import express from "express";

// 🧩 Import modular route files
import ordersRoutes from "./modules/orders/orders.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import notificationsRoutes from "./modules/notifications/notify.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* ✅ REGISTER ROUTES */
/* -------------------------------------------------------------------------- */

// 📦 Orders API
router.use("/orders", ordersRoutes);

// 💳 Payments API
router.use("/payments", paymentsRoutes);

// 📨 Notifications API
router.use("/notifications", notificationsRoutes);

// 🔐 Authentication API
router.use("/auth", authRoutes);

/* -------------------------------------------------------------------------- */
/* ✅ DEFAULT FALLBACK */
/* -------------------------------------------------------------------------- */
router.get("/", (req, res) => {
  res.send("🚀 BBA API Gateway Active — Orders, Payments, Notifications, Auth");
});

export default router;
