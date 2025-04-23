import express from "express";
import {
  createOrder,
  getOrder,
  updateOrderStatus,
  getOrdersByUser,
  getOrdersByRestaurant,
  modifyPendingOrder,
  addOrderItem,
  removeOrderItem,
  updateItemQuantity,
  confirmOrder
} from "../controllers/order_controller.js";

const router = express.Router();

// Existing routes
router.post("/", createOrder);
router.get("/user", getOrdersByUser);
router.get("/restaurant", getOrdersByRestaurant);
router.get("/:orderId", getOrder);
router.patch("/:orderId/status", updateOrderStatus);

// New routes for pre-confirmation modifications
router.patch("/:orderId/modify", modifyPendingOrder);
router.post("/:orderId/items", addOrderItem);
router.delete("/:orderId/items", removeOrderItem);
router.patch("/:orderId/items/quantity", updateItemQuantity);
router.post("/:orderId/confirm", confirmOrder);

export default router;
