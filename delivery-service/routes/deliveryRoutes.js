import express from 'express';
import createVehicle from "../controllers/vehicleController.js";
import { 
  createDelivery, 
  updateDeliveryStatus, 
  getDeliveriesByDriverId,
  getDeliveriesByRestaurantId,
  updateDeliveryAmount
} from '../controllers/deliveryController.js';

const router = express.Router();

router.post('/createVehicle', async (req, res) => {
  try {
    const { driverId, vehicleType, licensePlate } = req.body;
    
    // Check if driverId exists
    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }
    
    const newVehicle = await createVehicle(driverId, vehicleType, licensePlate);
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/createDelivery', async (req, res) => {
  try {
    const deliveryData = req.body;
    
    // Check if required fields exist in the request
    if (!deliveryData.driver_id) {
      return res.status(400).json({
        success: false,
        error: 'Driver ID is required'
      });
    }

    if (!deliveryData.restaurant_id) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID is required'
      });
    }

    if (deliveryData.total_amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Total amount is required'
      });
    }
    
    const newDelivery = await createDelivery(deliveryData);
    
    res.status(201).json({
      success: true,
      data: newDelivery
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const updatedDelivery = await updateDeliveryStatus(req.params.id, status);
    
    res.status(200).json({
      success: true,
      data: updatedDelivery
    });
  } catch (error) {
    if (error.message.includes('Invalid delivery ID format')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/driver/:driverId/deliveries', async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const deliveries = await getDeliveriesByDriverId(driverId);
    
    res.status(200).json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    if (error.message.includes('Invalid driver ID format')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error fetching deliveries'
    });
  }
});

// New route to get deliveries by restaurant ID
router.get('/restaurant/:restaurantId/deliveries', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const deliveries = await getDeliveriesByRestaurantId(restaurantId);
    
    res.status(200).json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    if (error.message.includes('Invalid restaurant ID format')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error fetching deliveries'
    });
  }
});

// New route to update the total amount of a delivery
router.put('/:id/amount', async (req, res) => {
  try {
    const { total_amount } = req.body;
    
    if (total_amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Total amount is required'
      });
    }
    
    const updatedDelivery = await updateDeliveryAmount(req.params.id, total_amount);
    
    res.status(200).json({
      success: true,
      data: updatedDelivery
    });
  } catch (error) {
    if (error.message.includes('Invalid delivery ID format')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;