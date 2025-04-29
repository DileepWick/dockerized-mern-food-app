import { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLoggedInUser } from '../../util/auth-utils';
import {
  confirmOrder,
  updateItemQuantity,
  removeOrderItem,
} from '../../util/order-utils';
import Header from '../Header';
import LoadingState from '../state/LoadingState';
import ErrorState from '../state/ErrorState';
import { sendEmail } from '../../util/notification-utils';

const CartPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

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

  const handleCheckout = async () => {
    try {
      setProcessing(true);

      if (
        !currentOrder ||
        !currentOrder.orderDetails ||
        !currentOrder.orderDetails.order_id
      ) {
        setError('Invalid order data. Please try again.');
        setProcessing(false);
        return;
      }

      await confirmOrder(currentOrder.orderDetails.order_id);

      // Clear cart data
      localStorage.removeItem('currentCart');
      localStorage.removeItem('currentOrder');

      sendEmail(
        user.email,"Order Confirmation From SnapByte",`<h1>Thank you for ordering from SnapByte!</h1><p>Your order is on the way 🚀</p><p>Order ID :${currentOrder.orderDetails.order_id}</p><p>Order ID :${currentOrder.orderDetails.total_amount}</p>`);

      // Redirect to orders page
      navigate('/MyOrders');
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Failed to place order. Please try again.');
      setProcessing(false);
    }
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className='w-screen bg-gray-50 min-h-screen poppins-regular'>
      <Header
        user={user}
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
      />

      <div className='mx-30 px-4 py-10 rounded-4xl shadow min-h-auto overflow-y-auto bg-white'>
        <div className='flex justify-between mb-6 px-4'>
          <h1 className='text-2xl font-bold ml-4 uppercase'>Your Cart</h1>{' '}
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
                    <span>LKR {(cartTotal + 200).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={processing || cart.length === 0}
                  className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400'
                >
                  {processing ? (
                    <div className='flex items-center justify-center'>
                      <Loader2 className='animate-spin h-5 w-5 mr-2' />
                      Processing...
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
