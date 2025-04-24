import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, updatePaymentStatus } from '../util/payment-utils';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = useState({
    amount: '',
    order_id: '',
    customer_id: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Step 1: Create a payment intent
  const handleCreatePaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await createPaymentIntent(formData);
      
      if (response.success) {
        setPaymentId(response.payment_id);
        return response.clientSecret;
      } else {
        throw new Error(response.message || 'Failed to create payment intent');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating payment intent');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Confirm payment with Stripe
  const confirmPayment = async (clientSecret) => {
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe has not loaded yet');
      }
      
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Step 3: Update payment status in our backend
        await handleUpdatePaymentStatus('SUCCESS');
        setSuccess(true);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      setError(err.message || 'Payment confirmation failed');
      // Update payment status to FAILED if it failed
      if (paymentId) {
        await handleUpdatePaymentStatus('FAILED');
      }
    }
  };
  
  // Update payment status in our database
  const handleUpdatePaymentStatus = async (status) => {
    try {
      await updatePaymentStatus(paymentId, status);
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Data validation
    if (!formData.amount || !formData.order_id || !formData.customer_id) {
      setError('Please fill in all fields');
      return;
    }
    
    // Create payment intent first
    const clientSecret = await handleCreatePaymentIntent();
    
    if (clientSecret) {
      // Then confirm payment with Stripe
      await confirmPayment(clientSecret);
    }
  };
  
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (success) {
    return (
      <div className="payment-success">
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment. Your payment ID is: {paymentId}</p>
        <button
          onClick={() => {
            setSuccess(false);
            setFormData({ amount: '', order_id: '', customer_id: '' });
          }}
          className="btn btn-primary"
        >
          Make Another Payment
        </button>
      </div>
    );
  }
  
  return (
    <div className="payment-form-container">
      <h2>Payment Form</h2>
      
      {error && <div className="error-message alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            step="0.01"
            min="0.50"
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="order_id">Order ID</label>
          <input
            type="text"
            id="order_id"
            name="order_id"
            value={formData.order_id}
            onChange={handleInputChange}
            placeholder="Enter order ID"
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group mb-3">
          <label htmlFor="customer_id">Customer ID</label>
          <input
            type="text"
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleInputChange}
            placeholder="Enter customer ID"
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group mb-4">
          <label htmlFor="card-element">Credit or debit card</label>
          <div className="card-element-container p-3 border rounded">
            <CardElement id="card-element" options={cardElementOptions} />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !stripe}
          className="btn btn-primary w-100"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;