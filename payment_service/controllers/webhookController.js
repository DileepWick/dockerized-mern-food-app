// File: controllers/webhookController.js
import mongoose from 'mongoose';
import stripe from '../config/stripe.js';
import Payment from '../models/payment.js';

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific webhook events
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Helper function to handle successful payments
const handlePaymentSuccess = async (paymentIntent) => {
  const { order_id, customer_id } = paymentIntent.metadata;
  
  // Update payment status in our database
  await Payment.findOneAndUpdate(
    { transaction_id: paymentIntent.id },
    { 
      status: 'SUCCESS',
      payment_time: new Date()
    }
  );
  
  // Here you could also notify the order service about successful payment
  console.log(`Payment succeeded for order ${order_id}`);
};

// Helper function to handle failed payments
const handlePaymentFailure = async (paymentIntent) => {
  // Update payment status in our database
  await Payment.findOneAndUpdate(
    { transaction_id: paymentIntent.id },
    { status: 'FAILED' }
  );
  
  console.log(`Payment failed for intent ${paymentIntent.id}`);
};