// File: routes/paymentRoutes.js
import express from 'express';
import { 
  createPaymentIntent, 
  getPaymentById, 
  getCustomerPayments, 
  getOrderPayments, 
  updatePaymentStatus,
  processRefund 
} from '../controllers/paymentController.js';

const router = express.Router();

// Create a new payment intent
router.post('/create-payment-intent', createPaymentIntent);   //use this 

// Get payment by ID
router.get('/:payment_id', getPaymentById);

// Get all payments for a customer
router.get('/customer/:customer_id', getCustomerPayments);

// Get all payments for an order
router.get('/order/:order_id', getOrderPayments);

// Update payment status manually
router.put('/:payment_id/status', updatePaymentStatus);    // and this

// Process refund
router.post('/refund/:payment_id', processRefund);

export default router;