import express from 'express';
import createVehicle from "../controllers/vehicleController.js";

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
  

export default router;
