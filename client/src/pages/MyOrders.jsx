// src/pages/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/MyOrders.css'; // Assuming you have a CSS file for styles
import Header from '@/components/Header';
import { getUserOrders } from '../util/order-utils';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  
  const statusOptions = [
    { value: null, label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PREPARED', label: 'Prepared' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
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
    ? orders.filter(order => order.status === activeFilter)
    : orders;

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="my-orders-container">
      <Header />
      <div className="page-header">
        <h1>My Orders</h1>
      </div>
      
      <div className="order-filters">
        <div className="filter-scroll">
          {statusOptions.map(option => (
            <button 
              key={option.value || 'all'} 
              className={`filter-btn ${activeFilter === option.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => setActiveFilter(activeFilter)}>
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="empty-illustration">
            <img src="/api/placeholder/120/120" alt="No orders" />
          </div>
          <h3>No orders found</h3>
          <p>You haven't placed any orders matching this filter yet.</p>
          <Link to="/restaurants" className="primary-btn">Browse Restaurants</Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <Link to={`/orders/${order.order_id}`} className="order-card" key={order.order_id}>
              <div className="order-header">
                <div className="restaurant-info">
                  <div className="restaurant-image">
                    <img src={order.restaurant?.image || '/api/placeholder/60/60'} alt={order.restaurant?.name} />
                  </div>
                  <div className="restaurant-details">
                    <h3>{order.restaurant?.name || 'Restaurant'}</h3>
                    <p className="order-id">Order #{order.order_id.substring(order.order_id.indexOf('-') + 1)}</p>
                  </div>
                </div>
                <div className="status-container">
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="order-date">
                <span className="date-value">{formatDate(order.placed_at)}</span>
              </div>
              
              <div className="order-items">
                {order.items.slice(0, 2).map(item => (
                  <div className="order-item" key={item.order_item_id}>
                    <div className="item-info">
                      <span className="item-quantity">{item.quantity}×</span>
                      <span className="item-name">{item.menu_item_name || item.menu_item_id}</span>
                    </div>
                    <span className="item-price">₹{item.total_price.toFixed(2)}</span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="more-items">
                    +{order.items.length - 2} more items
                  </div>
                )}
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">₹{order.total_amount.toFixed(2)}</span>
                </div>
                {order.status === 'PENDING' && order.modification_deadline && new Date(order.modification_deadline) > new Date() && (
                  <div className="modification-info">
                    <div className="time-icon">⏱️</div>
                    <span>Can modify for {Math.floor((new Date(order.modification_deadline) - new Date()) / 60000)} min</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;