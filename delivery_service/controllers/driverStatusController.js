import DeliveryDriverStatus from '../models/DeliveryDriverStatus.js';
import mongoose from 'mongoose';

// Create or update driver status
export const updateDriverStatus = async (req, res) => {
  try {
    const { driver_id, is_available, longitude, latitude } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(driver_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid driver ID format'
      });
    }
    
    const location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
    
    // Find and update or create if not exists
    let driverStatus = await DeliveryDriverStatus.findOne({ driver_id });
    
    if (driverStatus) {
      driverStatus.is_available = is_available !== undefined ? is_available : driverStatus.is_available;
      driverStatus.current_location = location;
      driverStatus.last_updated_at = new Date();
      await driverStatus.save();
    } else {
      driverStatus = new DeliveryDriverStatus({
        driver_id: new mongoose.Types.ObjectId(driver_id),
        is_available: is_available !== undefined ? is_available : true,
        current_location: location,
        last_updated_at: new Date()
      });
      await driverStatus.save();
    }
    
    res.status(200).json({
      success: true,
      data: driverStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get driver status
export const getDriverStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.driverId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid driver ID format'
      });
    }
    
    const driverStatus = await DeliveryDriverStatus.findOne({ driver_id: req.params.driverId });
    
    if (!driverStatus) {
      return res.status(404).json({
        success: false,
        error: 'Driver status not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: driverStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all available drivers
export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await DeliveryDriverStatus.find({ is_available: true });
    
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Find nearest available drivers
export const findNearestDrivers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000, limit = 5 } = req.query;
    
    const nearestDrivers = await DeliveryDriverStatus.find({
      is_available: true,
      current_location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance) // in meters
        }
      }
    }).limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: nearestDrivers.length,
      data: nearestDrivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};