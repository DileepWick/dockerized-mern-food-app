import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, updatePaymentStatus } from '../util/payment-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
        console.log('Payment intent created with ID:', response.payment_id);
        setPaymentId(response.payment_id);
        return { clientSecret: response.clientSecret, paymentId: response.payment_id };
      } else {
        // Show the specific error message from the API
        throw new Error(response.message || 'Failed to create payment intent');
      }
    } catch (err) {
      // Include any specific error information from the response
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred while creating payment intent';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Confirm payment with Stripe
  const confirmPayment = async (clientSecret, currentPaymentId) => {
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
        await handleUpdatePaymentStatus(currentPaymentId, 'SUCCESS');
        setSuccess(true);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      setError(err.message || 'Payment confirmation failed');
      // Update payment status to FAILED if it failed
      if (currentPaymentId) {
        await handleUpdatePaymentStatus(currentPaymentId, 'FAILED');
      }
    }
  };
  
  // Update payment status in our database
  const handleUpdatePaymentStatus = async (currentPaymentId, status) => {
    try {
      if (!currentPaymentId) {
        console.warn('Attempted to update payment status without a payment ID');
        return;
      }
      await updatePaymentStatus(currentPaymentId, status);
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
    const result = await handleCreatePaymentIntent();
    
    if (result && result.clientSecret && result.paymentId) {
      // Then confirm payment with Stripe
      await confirmPayment(result.clientSecret, result.paymentId);
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
      <div className="container mx-auto px-4 py-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600 h-6 w-6" />
              <CardTitle>Payment Successful!</CardTitle>
            </div>
            <CardDescription>Your transaction has been completed</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Payment ID</p>
                <p className="mt-1 text-sm font-mono">{paymentId}</p>
              </div>
              <p>Thank you for your payment. Your transaction was successful.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => {
                setSuccess(false);
                setPaymentId(null);
                setFormData({ amount: '', order_id: '', customer_id: '' });
              }}
            >
              Make Another Payment
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Form</CardTitle>
          <CardDescription>Enter your payment details</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-6 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 h-5 w-5 mt-0.5" />
                <div>
                  <p className="text-red-600 font-medium">Error</p>
                  <p className="text-red-600">{error}</p>
                  {error.includes('duplicate key error') && (
                    <p className="text-red-600 mt-2">There was an issue with your payment ID. Please try again.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-gray-500">
                Amount ($)
              </label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="order_id" className="text-sm font-medium text-gray-500">
                Order ID
              </label>
              <input
                type="text"
                id="order_id"
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                placeholder="Enter order ID"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="customer_id" className="text-sm font-medium text-gray-500">
                Customer ID
              </label>
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                placeholder="Enter customer ID"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="card-element" className="text-sm font-medium text-gray-500">
                Credit or debit card
              </label>
              <div className="p-3 border border-gray-300 rounded-md bg-white">
                <CardElement id="card-element" options={cardElementOptions} />
              </div>
            </div>
          </form>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !stripe}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Pay Now'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentForm;