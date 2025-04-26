import express from 'express';
import {
  createOrder,
  getOrder,
  updateOrderStatus,
  getOrdersByUser,
  getOrdersByRestaurant,
  getOrdersByPostalCode,
  modifyPendingOrder,
  addOrderItem,
  removeOrderItem,
  updateItemQuantity,
  confirmOrder
} from '../controllers/orderController.js';

const router = express.Router();

// User routes
router.post('/orders', createOrder);
router.get('/orders/user', getOrdersByUser);
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

export default router;