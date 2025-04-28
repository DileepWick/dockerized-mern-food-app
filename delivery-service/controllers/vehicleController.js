import Vehicle from '../models/Vehicle.js';
import { validateToken } from '../utils/validateUser.js';

/**
 * Creates a new vehicle after validating that the license plate doesn't already exist
 * @param {string} driverId - ID of the driver (user)
 * @param {string} vehicleType - Type of vehicle
 * @param {string} licensePlate - License plate number
 * @returns {Promise<Object>} - The saved vehicle object
 */
async function createVehicle(driverId, vehicleType, licensePlate) {
  try {
    // Check if a vehicle with the same license plate already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate: licensePlate.trim().toUpperCase() });
    
    if (existingVehicle) {
      throw new Error('A vehicle with this license plate already exists');
    }
    
    const vehicle = new Vehicle({
      driver: driverId,
      vehicleType: vehicleType,
      licensePlate: licensePlate
    });
    
    const savedVehicle = await vehicle.save();
    return savedVehicle;
  } catch (error) {
    throw new Error('Error creating vehicle: ' + error.message);
  }
}

export default createVehicle;