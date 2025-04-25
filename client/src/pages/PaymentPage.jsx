import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/paymentForm';

// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51RHOqvHQoMQTExGNrroYBPZTeRuB3RhRktcwiS3D9rjNCNzoiiKKSEHDdZOcmiPgBCB6L7AOOQgeBYR3NrZ0IpDA00a6jsybQS');

const PaymentPage = () => {
  return (
    <div className="payment-page">
      <h1>Complete Your Payment</h1>
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
};

export default PaymentPage;