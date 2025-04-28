import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { getUserOrders } from '../util/order-utils';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-600';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700';
      case 'prepared':
        return 'bg-green-50 text-green-700';
      case 'accepted':
        return 'bg-indigo-50 text-indigo-700';
      case 'picked_up':
        return 'bg-cyan-50 text-cyan-700';
      case 'delivered':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className='fixed inset-0 bg-white backdrop-blur-md flex w-full justify-center z-50 overflow-y-auto h-screen py-10'>
      <div className='bg-white rounded-lg max-w-2xl w-full  overflow-y-auto shadow-2xl p-10'>
        {/* Modal Header */}
        <div className='p-5 border-b border-gray-200 flex justify-between items-center top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-2xl'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Order Details</h2>
            <p className='text-sm text-gray-500'>
              Order #{order.order_id.substring(order.order_id.indexOf('-') + 1)}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-gray-100 text-gray-500 transition'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Restaurant Info */}
        <div className='p-5 border-b border-gray-100'>
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='font-semibold text-gray-900 uppercase mb-1'>
                {order.restaurant?.name || 'Restaurant'}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusClasses(
                order.status
              )}`}
            >
              {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Order Time Info */}
        <div className='p-5 bg-gray-50 border-b border-gray-100'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>Ordered on</p>
              <p className='font-medium'>{formatDate(order.placed_at)}</p>
            </div>
            {order.estimated_delivery && (
              <div>
                <p className='text-sm text-gray-500'>Estimated delivery</p>
                <p className='font-medium'>
                  {formatDate(order.estimated_delivery)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className='p-5 border-b border-gray-100'>
          <h4 className='font-semibold mb-3 text-gray-900'>Order Items</h4>
          {order.items.map((item) => (
            <div
              className='flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0'
              key={item.order_item_id}
            >
              <div className='flex items-center'>
                {item.image_url && (
                  <div className='mr-3'>
                    <img
                      src={item.image_url || '/api/placeholder/48/48'}
                      alt={item.name || 'Menu item'}
                      className='w-12 h-12 object-cover rounded'
                    />
                  </div>
                )}
                <div>
                  <p className='font-medium text-gray-900'>
                    {item.name || item.menu_item_id}
                  </p>
                  {item.customizations && (
                    <p className='text-sm text-gray-500'>
                      {item.customizations}
                    </p>
                  )}
                </div>
              </div>
              <div className='text-right'>
                <div className='font-medium text-gray-900'>
                  LKR {item.total_price.toFixed(2)}
                </div>
                <div className='text-sm text-gray-500'>
                  {item.quantity} × LKR{' '}
                  {(item.total_price / item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className='p-5 border-b border-gray-100'>
          <h4 className='font-semibold mb-3 text-gray-900'>Order Summary</h4>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Subtotal</span>
              <span className='text-gray-900'>
                LKR{' '}
                {(
                  order.total_amount -
                  (order.delivery_fee || 0) -
                  (order.tax || 0)
                ).toFixed(2)}
              </span>
            </div>
            {order.tax > 0 && (
              <div className='flex justify-between'>
                <span className='text-gray-600'>Tax</span>
                <span className='text-gray-900'>
                  LKR {order.tax.toFixed(2)}
                </span>
              </div>
            )}
            {order.delivery_fee > 0 && (
              <div className='flex justify-between'>
                <span className='text-gray-600'>Delivery Fee</span>
                <span className='text-gray-900'>
                  LKR {order.delivery_fee.toFixed(2)}
                </span>
              </div>
            )}
            <div className='flex justify-between pt-2 border-t border-gray-100 font-semibold'>
              <span>Total</span>
              <span>LKR {order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.delivery_address && (
          <div className='p-5 border-b border-gray-100'>
            <h4 className='font-semibold mb-2 text-gray-900'>
              Delivery Address
            </h4>
            <p className='text-gray-800'>{order.delivery_address}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className='p-5 flex justify-end space-x-3'>
          {order.status === 'PENDING' &&
            order.modification_deadline &&
            new Date(order.modification_deadline) > new Date() && (
              <button className='bg-gray-100 text-gray-800 py-2 px-4 rounded-full font-medium hover:bg-gray-200 transition-colors'>
                Modify Order
              </button>
            )}
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <button className='bg-red-50 text-red-700 py-2 px-4 rounded-full font-medium hover:bg-red-100 transition-colors'>
              Cancel Order
            </button>
          )}
          <button
            onClick={onClose}
            className='bg-gray-800 text-white py-2 px-6 rounded-full font-medium hover:bg-black transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ACCEPTED'); // Default to ACCEPTED
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: null, label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PREPARED', label: 'Prepared' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get authentication token from localStorage
        const token = localStorage.getItem('authToken');

        // Pass token in the request
        const data = await getUserOrders(activeFilter);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (err.response && err.response.status === 401) {
          setError('Please log in to view your orders.');
        } else {
          setError('Failed to load orders. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeFilter]);

  // Filter orders based on active filter
  const filteredOrders = activeFilter
    ? orders.filter((order) => order.status === activeFilter)
    : orders;

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-600';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700';
      case 'prepared':
        return 'bg-green-50 text-green-700';
      case 'accepted':
        return 'bg-indigo-50 text-indigo-700';
      case 'picked_up':
        return 'bg-cyan-50 text-cyan-700';
      case 'delivered':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleOrderClick = (order, e) => {
    e.preventDefault(); // Prevent navigation
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className='bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 font-sans text-gray-800 bg-gray-50 min-h-screen'>
        <Header />

        <div className='mb-5 overflow-hidden px-4'>
          <div className='flex overflow-x-auto pb-2.5 scrollbar-thin scroll-smooth'>
            {statusOptions.map((option) => (
              <button
                key={option.value || 'all'}
                className={`bg-transparent border border-gray-200 py-2 px-4 mr-2.5 rounded-full cursor-pointer text-sm whitespace-nowrap transition-all duration-200 hover:bg-gray-100 ${
                  activeFilter === option.value
                    ? 'bg-gray-800 text-black border-gray-800'
                    : 'text-gray-600'
                }`}
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className='flex flex-col items-center justify-center p-10'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4'></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='text-red-500 mb-4'>
              <svg
                width='64'
                height='64'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M12 8V12'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M12 16H12.01'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium mb-1'>Something went wrong</h3>
            <p className='mb-4 text-gray-600'>{error}</p>
            <button
              className='bg-gray-800 text-white border-none py-2 px-6 rounded-full font-medium transition-all duration-300 hover:bg-black text-sm'
              onClick={() => setActiveFilter(activeFilter)}
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center text-center py-14 px-5 bg-gray-50 rounded-lg border border-gray-200'>
            <h3 className='text-lg font-medium mb-2.5 text-gray-800'>
              No orders found
            </h3>
            <p className='mb-5 text-gray-600'>
              You haven't placed any orders matching this filter yet.
            </p>
            <Link
              to='/userPage'
              className='bg-gray-800 text-white border-none py-2.5 px-6 rounded-full font-medium transition-all duration-300 hover:bg-black text-sm no-underline'
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className='grid gap-10 px-4'>
            {filteredOrders.map((order) => (
              <div
                className='bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md block no-underline text-inherit cursor-pointer'
                key={order.order_id}
                onClick={(e) => handleOrderClick(order, e)}
              >
                <div className='flex justify-between items-center p-4 border-b border-gray-100 sm:flex-row flex-col sm:items-center sm:space-y-0 space-y-2.5'>
                  <div className='flex items-center sm:mb-0 w-full sm:w-auto'>
                    <div>
                      <h3 className='m-0 text-base font-semibold text-gray-900 uppercase'>
                        {order.restaurant?.name || 'Restaurant'}
                      </h3>
                      <p className='text-gray-500 text-xs mt-0.5'>
                        Order #
                        {order.order_id.substring(
                          order.order_id.indexOf('-') + 1
                        )}
                      </p>
                    </div>
                  </div>
                  <div className='self-start sm:self-auto'>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClasses(
                        order.status
                      )}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className='py-2.5 px-4 bg-gray-50 text-sm text-gray-500 border-b border-gray-100'>
                  {formatDate(order.placed_at)}
                </div>

                <div className='p-4'>
                  {order.items.slice(0, 2).map((item) => (
                    <div
                      className='flex justify-between items-center mb-2.5'
                      key={item.order_item_id}
                    >
                      {item.image_url && (
                        <div className='mr-3'>
                          <img
                            src={item.image_url || '/api/placeholder/40/40'}
                            alt={item.name || 'Menu item'}
                            className='w-6 h-6 object-cover rounded'
                          />
                        </div>
                      )}
                      <div className='flex items-center flex-grow'>
                        <span className='font-semibold text-gray-800 mr-1.5'>
                          {item.quantity}×
                        </span>
                        <span className='text-gray-800'>
                          {item.name || item.menu_item_id}
                        </span>
                      </div>
                      <span className='font-medium text-gray-800'>
                        LKR {item.total_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className='text-sm text-gray-500 pt-1'>
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>

                <div className='flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50'>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-gray-600 font-medium'>Total:</span>
                    <span className='font-bold text-gray-900 text-base'>
                      LKR {order.total_amount.toFixed(2)}
                    </span>
                  </div>
                  {order.status === 'PENDING' &&
                    order.modification_deadline &&
                    new Date(order.modification_deadline) > new Date() && (
                      <div className='flex items-center text-sm ml-4'>
                        <div className='mr-1'>⏱️</div>
                        <span>
                          Can modify for{' '}
                          {Math.floor(
                            (new Date(order.modification_deadline) -
                              new Date()) /
                              60000
                          )}{' '}
                          min
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default MyOrders;
