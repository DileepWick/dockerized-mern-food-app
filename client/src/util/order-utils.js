
// src/util/order-utils.js
import axios from 'axios';
import { orderService } from './service-gateways.js'; // Import centralized API instance

// Get all orders for the current logged-in user with optional status filter
export const getUserOrders = async (statusFilter = null) => {
  try {
    // Make sure this endpoint matches exactly what's defined in your backend
    let url = `${orderService}user/orders`;
    
    // Add status filter if provided
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }
    
    // Get the authentication token
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true // This ensures cookies are sent with the request
    };
    
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Create a new order
export const createOrder = async (restaurantId, items) => {
  try {

    const response = await orderService.post('/orders',{
      restaurant_id: restaurantId,
      items
    });

    return response.data;  // FULL response, not just orderDetails
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
  
// Add an item to an existing order - Fixed to properly return the updated order with items
export const addOrderItem = async (orderId, menuItemId, quantity = 1) => {
  try {
    // Define the URL as a variable
    let url = `${orderService}/orders/${orderId}/add-item`;
    
    // Get the authentication token
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true // This ensures cookies are sent with the request
    };
    
    const response = await axios.patch(
      url,
      {
        menu_item_id: menuItemId,
        quantity
      },
      config
    );
    
    // Return the updated order so we can get the new order_item_id
    return response.data;
  } catch (error) {
    console.error('Error adding item to order:', error);
    throw error;
  }
};

// Remove an item from an existing order
export const removeOrderItem = async (orderId, orderItemId) => {
  try {
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };
    
    const response = await axios.patch(
      `${orderService}/orders/${orderId}/remove-item`,
      {
        order_item_id: orderItemId
      },
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error removing item from order:', error);
    throw error;
  }
};

// Update the quantity of an item in an existing order
export const updateItemQuantity = async (orderId, orderItemId, quantity) => {
  try {
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };
    
    const response = await axios.patch(
      `${orderService}/orders/${orderId}/update-quantity`,
      {
        order_item_id: orderItemId,
        quantity
      },
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating item quantity:', error);
    throw error;
  }
};

// Confirm an order
export const confirmOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };
    
    const response = await axios.patch(
      `${orderService}/orders/${orderId}/confirm`,
      {},
      config
    );
    
    return response.data;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};

// Get all orders for a specific restaurant
export const getRestaurantOrders = async (restaurantId, statusFilter = null) => {
    try {
      // Make sure this endpoint matches your backend route
      let url = `${orderService}/restaurants/${restaurantId}/orders`;
      
      // Add status filter if provided
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      
      console.log('Fetching orders from URL:', url);
      
      const token = localStorage.getItem('authToken');
      const config = {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };
      
      const response = await axios.get(url, config);
      console.log('Raw API response:', response);
      
      // Check the structure of the response
      if (response.data) {
        console.log('Response data structure:', {
          isArray: Array.isArray(response.data),
          hasOrdersProperty: response.data.hasOwnProperty('orders'),
          keys: Object.keys(response.data)
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    }
  };



// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };
      
      console.log(`Updating order ${orderId} to status: ${status}`);
      
      const response = await axios.patch(
        `${orderService}/orders/${orderId}/status`,
        { status }, // Send status as is - already uppercase from the component
        config
      );
      
      console.log('Status update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      // Add more detailed error logging
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
      }
      throw error;
    }
  };



// Get orders by postal code from order service (NO STATUS FILTER ANYMORE)
export const getOrdersByPostalCode = async (postalCode) => {
  try {
    console.log("Fetching orders for postal code:", postalCode); // Debug log
    const response = await orderService.get(`/orders/postal-code/${postalCode}`);
    console.log("Fetched orders:", response.data); // Debug log
    return response.data; // Contains array of orders
  } catch (error) {
    console.error("Get orders by postal code error:", error.response?.data?.message || error.message);
    return null;
  }
};

// Update order status through delivery service
export const updateOrderStatusByDriver = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to: ${status}`); // Debug log
    const response = await orderService.patch(`/orders/${orderId}/driver-status`, {
      status: status
    });
    console.log("Order status updated:", response.data); // Debug log
    return response.data; // Contains updated order object
  } catch (error) {
    console.error("Update order status error:", error.response?.data?.message || error.message);
    return null;
  }
};


export const getOrderById = async (orderId) => {
  try {
    // Define the URL to fetch the order by MongoDB _id
    const url = `${orderService}/orders/id/${orderId}`;
    
    // Get the authentication token
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      withCredentials: true // This ensures cookies are sent with the request
    };
    
    // Make the API request
    const response = await axios.get(url, config);
    
    console.log('Fetched order details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order by MongoDB _id:', error);
    // Provide more detailed error logging
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
    }
    throw error;
  }
};

