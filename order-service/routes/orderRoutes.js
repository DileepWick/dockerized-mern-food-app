import express from 'express';
import {
  createOrder,
  getOrder,
  updateOrderStatus,
  
  getOrdersByRestaurant,
  getOrdersByPostalCode,
  modifyPendingOrder,
  addOrderItem,
  removeOrderItem,
  updateItemQuantity,
  confirmOrder,
  getUserOrders,
  updateOrderStatusByDriver,
  getOrderById
} from '../controllers/orderController.js';

const router = express.Router();

router.get("/user/orders", getUserOrders);

// User routes
router.post('/orders', createOrder);

router.patch('/orders/:orderId', modifyPendingOrder);
router.patch('/orders/:orderId/add-item', addOrderItem);
router.patch('/orders/:orderId/remove-item', removeOrderItem);
router.patch('/orders/:orderId/update-quantity', updateItemQuantity);
router.patch('/orders/:orderId/confirm', confirmOrder);

// Common routes
router.get('/orders/:orderId', getOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);

// Restaurant routes
router.get('/restaurants/:restaurantId/orders', getOrdersByRestaurant);

// Driver routes
router.get('/orders/postal-code/:postalCode', getOrdersByPostalCode);
router.patch('/orders/:orderId/driver-status', updateOrderStatusByDriver);
router.get('/orders/id/:id', getOrderById);

export default router;