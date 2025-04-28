import { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getLoggedInUser } from '../../util/auth-utils';
import {
  confirmOrder,
  updateItemQuantity,
  removeOrderItem,
} from '../../util/order-utils';
import { 
  createPaymentIntent, 
  updatePaymentStatus 
} from '../../util/payment-utils';
import Header from '../Header';
import LoadingState from '../state/LoadingState';
import ErrorState from '../state/ErrorState';

const CartPage = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Payment related states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getLoggedInUser();
        
        if (!userData) {
          setError('You must be logged in to view this page');
          setLoading(false);
          return;
        }

        setUser(userData);

        // Get cart from localStorage
        const storedCart = localStorage.getItem('currentCart');
        const storedOrder = localStorage.getItem('currentOrder');

        if (storedCart && storedOrder) {
          setCart(JSON.parse(storedCart));
          setCurrentOrder(JSON.parse(storedOrder));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuantityChange = async (item, change) => {
    try {
      const newQuantity = item.quantity + change;

      if (newQuantity <= 0) {
        // Remove item if quantity becomes 0
        if (!item.order_item_id) {
          console.error('Missing order_item_id for item:', item);
          setError('Unable to remove item: missing item ID');
          return;
        }

        // Use the original string order_id for existing functions
        await removeOrderItem(
          currentOrder.orderDetails.order_id,
          item.order_item_id
        );
        const updatedCart = cart.filter(
          (cartItem) => cartItem._id !== item._id
        );
        setCart(updatedCart);
        localStorage.setItem('currentCart', JSON.stringify(updatedCart));
      } else {
        // Update quantity
        if (!item.order_item_id) {
          console.error('Missing order_item_id for item:', item);
          setError('Unable to update item: missing item ID');
          return;
        }

        // Use the original string order_id for existing functions
        await updateItemQuantity(
          currentOrder.orderDetails.order_id,
          item.order_item_id,
          newQuantity
        );
        const updatedCart = cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
        setCart(updatedCart);
        localStorage.setItem('currentCart', JSON.stringify(updatedCart));
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Failed to update cart. Please try again.');
    }
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  const totalWithDelivery = cartTotal + 200; // Add 200 LKR delivery fee

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setShowPaymentForm(true);
  };
  
  // Handle payment intent creation - Use MongoDB ID for payment
  const handleCreatePaymentIntent = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      if (!currentOrder || !currentOrder.orderDetails) {
        throw new Error('Order information is missing');
      }
      
      // Use the MongoDB _id for payment
      const orderId = currentOrder.orderDetails._id;
      
      // Extract customer ID from your order structure
      const customerId = currentOrder.orderDetails.user_id;
      
      if (!orderId) {
        console.error('MongoDB ObjectId is missing in order details');
        throw new Error('MongoDB Order ID is missing');
      }
      
      if (!customerId) {
        throw new Error('Customer ID is missing');
      }
      
      // Create payment data using the MongoDB _id for order_id
      const paymentData = {
        amount: totalWithDelivery,
        order_id: orderId,
        customer_id: customerId
      };
      
      console.log('Sending payment data with MongoDB ID:', paymentData);
      
      // Create payment intent
      const response = await createPaymentIntent(paymentData);
      console.log('Payment intent response:', response);
      
      if (response && response.success) {
        console.log('Payment ID from response:', response.payment_id);
        setPaymentId(response.payment_id);
        return { 
          clientSecret: response.clientSecret, 
          paymentId: response.payment_id 
        };
      } else {
        throw new Error(response?.message || 'Failed to create payment intent');
      }
    } catch (err) {
      console.error('Payment intent creation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred while creating payment intent';
      setError(errorMessage);
      return null;
    } finally {
      setProcessing(false);
    }
  };
  
  // Confirm payment with Stripe
  const confirmPayment = async (clientSecret, currentPaymentId) => {
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe has not loaded yet');
      }
      
      if (!currentPaymentId) {
        throw new Error('Payment ID is missing, cannot process payment');
      }
      
      console.log('Confirming payment with ID:', currentPaymentId);
      
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
      
      if (error) {
        console.error('Stripe confirmation error:', error);
        throw new Error(error.message);
      }
      
      console.log('Payment intent result:', paymentIntent);
      
      if (paymentIntent.status === 'succeeded') {
        // Update the payment status in your backend
        console.log('Updating payment status to SUCCESS for ID:', currentPaymentId);
        const statusResponse = await updatePaymentStatus(currentPaymentId, 'SUCCESS');
        console.log('Status update response:', statusResponse);
        
        if (!statusResponse.success) {
          console.error('Payment status update failed:', statusResponse);
          throw new Error(statusResponse.error || 'Failed to update payment status');
        }
        
        setPaymentSuccess(true);
        
        // Complete the order using the STRING order_id (not MongoDB ID)
        const stringOrderId = currentOrder.orderDetails.order_id;
        console.log('Confirming order with string order ID:', stringOrderId);
        await confirmOrder(stringOrderId);
        
        // Clear cart data
        localStorage.removeItem('currentCart');
        localStorage.removeItem('currentOrder');
        
        // Short delay before redirect
        setTimeout(() => {
          navigate('/MyOrders');
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setError(err.message || 'Payment confirmation failed');
      if (currentPaymentId) {
        try {
          await updatePaymentStatus(currentPaymentId, 'FAILED');
        } catch (statusErr) {
          console.error('Failed to update payment status to FAILED:', statusErr);
        }
      }
    }
  };
  
  const handlePayNow = async () => {
    try {
      const result = await handleCreatePaymentIntent();
      
      if (!result) {
        throw new Error('Failed to create payment intent');
      }
      
      if (!result.clientSecret) {
        throw new Error('Missing client secret from payment intent');
      }
      
      if (!result.paymentId) {
        throw new Error('Missing payment ID from payment intent');
      }
      
      console.log('Payment intent created successfully with ID:', result.paymentId);
      await confirmPayment(result.clientSecret, result.paymentId);
    } catch (err) {
      console.error('Pay now error:', err);
      setError(err.message || 'Payment failed');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Card element styling options
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

  return (
    <div className='w-screen bg-gray-50 min-h-screen poppins-regular'>
      <Header
        user={user}
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
      />

      <div className='mx-30 px-4 py-10 rounded-4xl shadow min-h-auto overflow-y-auto bg-white'>
        <div className='flex justify-between mb-6 px-4'>
          <h1 className='text-2xl font-bold ml-4 uppercase'>Your Cart</h1>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-blue-600 hover:text-blue-800'
          >
            <ArrowLeft className='h-5 w-5 mr-1' />
            Back
          </button>
        </div>

        {cart.length === 0 ? (
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <ShoppingBag className='h-12 w-12 mx-auto text-gray-400 mb-4' />
            <h2 className='text-xl font-medium mb-2'>Your cart is empty</h2>
            <p className='text-gray-500 mb-6'>
              Looks like you haven't added any items yet.
            </p>
            <button
              onClick={() => navigate('/userPage')}
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 px-4'>
            <div className='md:col-span-2'>
              <div className='bg-white rounded-lg shadow overflow-hidden'>
                <div className='p-4 border-b bg-stone-100'>
                  <h2 className='text-lg font-medium uppercase'>Order Items</h2>
                </div>
                <div className='divide-y'>
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className='p-4 flex items-center justify-between'
                    >
                      <div className='flex items-center space-x-4'>
                        <div>
                          <h3 className='font-medium'>{item.name}</h3>
                          <p className='text-sm text-gray-500'>
                            LKR {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className='w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100'
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className='w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100'
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className='bg-white rounded-lg shadow p-4'>
                <h2 className='text-lg font-medium mb-4'>Order Summary</h2>
                <div className='space-y-3 mb-4'>
                  <div className='flex justify-between'>
                    <span>Subtotal</span>
                    <span>LKR {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Delivery Fee</span>
                    <span>LKR 200.00</span>
                  </div>
                  <div className='border-t pt-3 font-medium flex justify-between'>
                    <span>Total</span>
                    <span>LKR {totalWithDelivery.toFixed(2)}</span>
                  </div>
                </div>
                
                {!showPaymentForm ? (
                  <button
                    onClick={handleProceedToPayment}
                    disabled={cart.length === 0}
                    className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400'
                  >
                    Proceed to Payment
                  </button>
                ) : paymentSuccess ? (
                  <div className='bg-green-50 p-4 rounded-md border border-green-200 text-center'>
                    <CheckCircle className='h-12 w-12 mx-auto text-green-600 mb-2' />
                    <h3 className='text-lg font-medium text-green-800'>Payment Successful!</h3>
                    <p className='text-green-700 mb-2'>Your order has been placed successfully.</p>
                    <p className='text-sm text-green-600'>Redirecting to your orders...</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Payment Details</h3>
                    
                    {error && (
                      <div className='bg-red-50 p-3 rounded-md border border-red-200'>
                        <div className='flex items-start gap-2'>
                          <AlertCircle className='text-red-600 h-5 w-5 mt-0.5' />
                          <p className='text-red-600 text-sm'>{error}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-500'>Card Information</label>
                      <div className='p-3 border border-gray-300 rounded-md bg-white'>
                        <CardElement options={cardElementOptions} />
                      </div>
                    </div>
                    
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => setShowPaymentForm(false)}
                        className='flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300'
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePayNow}
                        disabled={processing || !stripe}
                        className='flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400'
                      >
                        {processing ? (
                          <div className='flex items-center justify-center'>
                            <Loader2 className='animate-spin h-5 w-5 mr-2' />
                            Processing...
                          </div>
                        ) : (
                          'Pay Now'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;