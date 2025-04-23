import Delivery from '../models/Delivery.js';
import mongoose from 'mongoose';

// Create a new delivery
export const createDelivery = async (req, res) => {
  try {
    const { order_id, driver_id } = req.body;
    
    const delivery = new Delivery({
      order_id: new mongoose.Types.ObjectId(order_id),
      driver_id: new mongoose.Types.ObjectId(driver_id),
      assigned_at: new Date()
    });

    const savedDelivery = await delivery.save();
    
    res.status(201).json({
      success: true,
      data: savedDelivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get delivery by ID
export const getDeliveryById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery ID format'
      });
    }
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get delivery by order ID
export const getDeliveryByOrderId = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID format'
      });
    }
    
    const delivery = await Delivery.findOne({ order_id: req.params.orderId });
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update delivery pickup time
export const updatePickupTime = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery ID format'
      });
    }
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { picked_up_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update delivery completion time
export const completeDelivery = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery ID format'
      });
    }
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { delivered_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Reassign a delivery to a different driver
export const reassignDriver = async (req, res) => {
  try {
    const { driver_id } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(driver_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { driver_id: new mongoose.Types.ObjectId(driver_id) },
      { new: true, runValidators: true }
    );
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all deliveries for a driver
export const getDriverDeliveries = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.driverId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid driver ID format'
      });
    }
    
    const deliveries = await Delivery.find({ driver_id: req.params.driverId });
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};