import express from 'express';
import {
  createDelivery,
  getDeliveryById,
  getDeliveryByOrderId,
  getDriverDeliveries,
  updatePickupTime,
  completeDelivery,
  reassignDriver
} from '../controllers/deliveryController.js';

const router = express.Router();

router.post('/create', createDelivery);
router.get('/:id', getDeliveryById);
router.get('/order/:orderId', getDeliveryByOrderId);
router.get('/driver/:driverId', getDriverDeliveries);
router.put('/:id/pickup', updatePickupTime);
router.put('/:id/complete', completeDelivery);


export default router;
