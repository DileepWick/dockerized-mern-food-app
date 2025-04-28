import { deliveryService } from './service-gateways.js';

export const createVehicle = async (driverId, vehicleType, licensePlate) => {
  try {
    console.log("Creating vehicle for driver:", driverId); // Debug log
    const response = await deliveryService.post('/createVehicle', {
      driverId,
      vehicleType,
      licensePlate
    });
    console.log("Vehicle created successfully:", response.data); // Debug log
    return response.data; // Returns the created vehicle
  } catch (error) {
    console.error("Create vehicle error:", error.response?.data?.message || error.message); // Error logging
    return null; // In case of error, return null
  }
};

export const createDeliveryUtil = async (deliveryData) => {
  try {
    console.log("Creating delivery for order:", deliveryData.order_id); // Debug log
    
    // Validate required fields before making the request
    if (!deliveryData.order_id || !deliveryData.driver_id || 
        !deliveryData.buyer_address || !deliveryData.restaurant_address || 
        !deliveryData.items || !deliveryData.restaurant_id || 
        deliveryData.total_amount === undefined) {
      throw new Error('Missing required delivery information');
    }

    // Additional validation for the new fields
    if (!deliveryData.restaurant_id) {
      throw new Error('Restaurant ID is required');
    }

    if (typeof deliveryData.total_amount !== 'number' || deliveryData.total_amount <= 0) {
      throw new Error('Total amount must be a positive number');
    }

    const response = await deliveryService.post('/createDelivery', deliveryData);
    console.log("Delivery created successfully:", response.data); // Debug log
    return response.data; // Returns the created delivery
  } catch (error) {
    console.error("Create delivery error:", error.response?.data?.message || error.message);
    throw error; // Re-throw the error for the controller to handle
  }
};

export const updateDeliveryStatusUtil = async (deliveryId, newStatus) => {
  try {
    console.log(`Updating status for delivery ${deliveryId} to ${newStatus}`); // Debug log
    
    // Validate the status is one of the allowed values
    const validStatuses = ['PICKED_UP', 'DELIVERED', 'CANCELLED', 'ACCEPTED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Updated endpoint to match the new route structure
    const response = await deliveryService.put(`/status/${deliveryId}`, { status: newStatus });
    console.log("Delivery status updated successfully:", response.data); // Debug log
    return response.data; // Returns the updated delivery
  } catch (error) {
    console.error("Update delivery status error:", error.response?.data?.message || error.message);
    throw error; // Re-throw the error for the controller to handle
  }
};

export const getDeliveriesByDriverIdUtil = async (driverId) => {
  try {
    console.log(`Fetching deliveries for driver: ${driverId}`); // Debug log
    
    // Input validation
    if (!driverId) {
      throw new Error('Driver ID is required');
    }

    const response = await deliveryService.get(`/driver/${driverId}/deliveries`);
    console.log(`Found ${response.data?.data?.length || 0} deliveries for driver`); // Debug log
    return response.data?.data || []; // Return the data array or empty array
  } catch (error) {
    console.error("Get deliveries error:", error.response?.data?.message || error.message);
    return []; // Return empty array in case of error
  }
};

// New utility function to get deliveries by restaurant ID
export const getDeliveriesByRestaurantIdUtil = async (restaurantId) => {
  try {
    console.log(`Fetching deliveries for restaurant: ${restaurantId}`); // Debug log
    
    // Input validation
    if (!restaurantId) {
      throw new Error('Restaurant ID is required');
    }

    const response = await deliveryService.get(`/restaurant/${restaurantId}/deliveries`);
    console.log(`Found ${response.data?.data?.length || 0} deliveries for restaurant`); // Debug log
    return response.data?.data || []; // Return the data array or empty array
  } catch (error) {
    console.error("Get restaurant deliveries error:", error.response?.data?.message || error.message);
    return []; // Return empty array in case of error
  }
};

// New utility function to update the total amount of a delivery
export const updateDeliveryAmountUtil = async (deliveryId, amount) => {
  try {
    console.log(`Updating amount for delivery ${deliveryId} to ${amount}`); // Debug log
    
    // Validate the amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Total amount must be a positive number');
    }

    const response = await deliveryService.put(`/${deliveryId}/amount`, { total_amount: amount });
    console.log("Delivery amount updated successfully:", response.data); // Debug log
    return response.data; // Returns the updated delivery
  } catch (error) {
    console.error("Update delivery amount error:", error.response?.data?.message || error.message);
    throw error; // Re-throw the error for the controller to handle
  }
};