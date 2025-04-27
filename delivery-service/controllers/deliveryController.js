import Delivery from '../models/Delivery.js';
import mongoose from 'mongoose';
import { validateToken } from '../utils/validateUser.js';
import { getUserById } from '../utils/userUtils.js';
import { updateOrderStatus } from '../utils/orderUtils.js';

export const createDelivery = async (deliveryData) => {
  try {
    // Validate required fields
    if (!deliveryData.order_id || !deliveryData.driver_id || 
        !deliveryData.buyer_address || !deliveryData.restaurant_address || 
        !deliveryData.items) {
      throw new Error('Missing required delivery information');
    }
    
    // Validate order_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryData.order_id)) {
      throw new Error('Invalid order_id format');
    }
    
    // Validate driver_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryData.driver_id)) {
      throw new Error('Invalid driver_id format');
    }
    
    // Create new delivery with assignment time
    const newDelivery = new Delivery({
      ...deliveryData,
      assigned_at: new Date(),
      status: 'ACCEPTED' // Default status
    });
    
    // Save to database
    const savedDelivery = await newDelivery.save();
    return savedDelivery;
  } catch (error) {
    console.error('Error creating delivery:', error);
    throw error;
  }
};

export const updateDeliveryStatus = async (deliveryId, newStatus) => {
  try {
    // Validate deliveryId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      throw new Error('Invalid delivery ID format');
    }
    
    // Validate the status is one of the allowed enum values
    const validStatuses = ['PICKED_UP', 'DELIVERED', 'CANCELLED', 'ACCEPTED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Find and update the delivery
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { status: newStatus },
      { new: true, runValidators: true } // Return updated document and run schema validators
    );
    
    if (!updatedDelivery) {
      throw new Error(`Delivery with ID ${deliveryId} not found`);
    }
    
    return updatedDelivery;
  } catch (error) {
    console.error('Error updating delivery status:', error);
    throw error;
  }
};

export const getDeliveriesByDriverId = async (driverId) => {
  try {
    // Validate driverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      throw new Error('Invalid driver ID format');
    }
    
    // Find all deliveries with the specified driver_id
    const deliveries = await Delivery.find({ driver_id: driverId })
      .sort({ createdAt: -1 });
    
    return deliveries;
  } catch (error) {
    console.error('Error getting deliveries by driver ID:', error);
    throw error;
  }
};