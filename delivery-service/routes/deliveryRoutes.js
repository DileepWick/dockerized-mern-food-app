import express from 'express';
import createVehicle from "../controllers/vehicleController.js";
import { createDelivery, updateDeliveryStatus } from '../controllers/deliveryController.js';


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
  

  router.put('/status/:id/status', async (req, res) => {
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
  


  

export default router;
