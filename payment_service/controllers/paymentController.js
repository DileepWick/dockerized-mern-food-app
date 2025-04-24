// File: controllers/paymentController.js
import mongoose from 'mongoose';
import stripe from '../config/stripe.js';
import Payment from '../models/payment.js';

// Create a payment intent with Stripe
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, order_id, customer_id } = req.body;

    if (!amount || !order_id || !customer_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide amount, order_id, and customer_id' 
      });
    }

    // Convert string IDs to ObjectIds
    const orderObjectId = mongoose.Types.ObjectId.isValid(order_id) ? 
                          new mongoose.Types.ObjectId(order_id) : null;
    const customerObjectId = mongoose.Types.ObjectId.isValid(customer_id) ? 
                             new mongoose.Types.ObjectId(customer_id) : null;

    if (!orderObjectId || !customerObjectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order_id or customer_id format'
      });
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency: 'usd',
      metadata: {
        order_id,
        customer_id
      }
    });

    // Create record in our database
    const payment = new Payment({
      // MongoDB will automatically generate _id
      order_id: orderObjectId,
      customer_id: customerObjectId,
      amount,
      method: 'STRIPE',
      transaction_id: paymentIntent.id,
      status: 'PENDING'
    });

    await payment.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      payment_id: payment._id // Use MongoDB's generated _id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(payment_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment_id format'
      });
    }
    
    const payment = await Payment.findById(payment_id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

// Get all payments for a customer
export const getCustomerPayments = async (req, res) => {
  try {
    const { customer_id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer_id format'
      });
    }

    const customerObjectId = new mongoose.Types.ObjectId(customer_id);
    const payments = await Payment.find({ customer_id: customerObjectId });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer payments',
      error: error.message
    });
  }
};

// Get all payments for an order
export const getOrderPayments = async (req, res) => {
  try {
    const { order_id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order_id format'
      });
    }

    const orderObjectId = new mongoose.Types.ObjectId(order_id);
    const payments = await Payment.find({ order_id: orderObjectId });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error fetching order payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order payments',
      error: error.message
    });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(payment_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment_id format'
      });
    }
    
    const payment = await Payment.findById(payment_id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Only successful payments can be refunded'
      });
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.transaction_id
    });

    // Update payment status in database
    payment.status = 'REFUNDED';
    payment.metadata = { ...payment.metadata, refund_id: refund.id };
    await payment.save();

    res.status(200).json({
      success: true,
      refund,
      payment
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};