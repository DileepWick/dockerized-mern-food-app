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
        !deliveryData.items) {
      throw new Error('Missing required delivery information');
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
    const validStatuses = ['PICKED_UP', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const response = await deliveryService.put(`/status/${deliveryId}/status`, { status: newStatus });
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