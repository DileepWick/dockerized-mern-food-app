import Delivery from '../models/Delivery.js';
import mongoose from 'mongoose';


// Create a new delivery
export const createDelivery = async (req, res) => {
  try {
    const { order_id, driver_id } = req.body;
    
    const delivery = new Delivery({
      order_id: new mongoose.Types.ObjectId(String(order_id)),
      driver_id: new mongoose.Types.ObjectId(String(driver_id)),
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
