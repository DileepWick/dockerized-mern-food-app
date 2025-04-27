import Vehicle from '../models/Vehicle.js';
import { validateToken } from '../utils/validateUser.js';


async function createVehicle(driverId, vehicleType, licensePlate) {
  try {
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

export default createVehicle