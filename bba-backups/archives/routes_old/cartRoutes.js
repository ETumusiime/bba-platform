import express from "express";
import {
  addToCart,
  getCartItems,
  removeFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:user_id", getCartItems);
router.delete("/remove/:isbn", removeFromCart);

export default router;
