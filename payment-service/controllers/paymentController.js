// File: controllers/paymentController.js
import mongoose from 'mongoose';
import stripe from '../config/stripe.js';
import Payment from '../models/payment.js';
import { validateToken } from '../utils/validateUser.js';

// Create a payment intent with Stripe
export const createPaymentIntent = async (req, res) => {
  const token = req.cookies.token;
  const user = await validateToken(token);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });


  try {
    const { amount, order_id, customer_id } = req.body;

    if (!amount || !order_id || !customer_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide amount, order_id, and customer_id' 
      });
    }

    // Convert string IDs to ObjectIds using proper method
    const orderObjectId = mongoose.Types.ObjectId.isValid(order_id) ? 
                          new mongoose.Types.ObjectId(order_id.toString()) : null;
    const customerObjectId = mongoose.Types.ObjectId.isValid(customer_id) ? 
                             new mongoose.Types.ObjectId(customer_id.toString()) : null;

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
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        order_id: order_id.toString(),
        customer_id: customer_id.toString()
      }
    });

    // Generate a unique payment_id
    const uniquePaymentId = new mongoose.Types.ObjectId().toString();

    // Create record in our database
    const payment = new Payment({
      payment_id: uniquePaymentId, // Explicitly set a unique payment_id
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
      payment_id: payment.payment_id // Use the payment_id field instead of _id
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
    
    // Find by payment_id string field, not MongoDB _id
    const payment = await Payment.findOne({ payment_id });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment id not found'
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

    const customerObjectId = new mongoose.Types.ObjectId(customer_id.toString());
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

    const orderObjectId = new mongoose.Types.ObjectId(order_id.toString());
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

// Manually update payment status (since we're not using webhooks)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { status } = req.body;
    
    if (!status || !['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Find by payment_id string field, not MongoDB _id
    const payment = await Payment.findOneAndUpdate(
      { payment_id },
      { status, ...(status === 'SUCCESS' ? { payment_time: new Date() } : {}) },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    // Find by payment_id string field, not MongoDB _id
    const payment = await Payment.findOne({ payment_id });
    
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

    try {
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
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);
      res.status(400).json({
        success: false,
        message: 'Error processing refund with Stripe',
        error: stripeError.message
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};