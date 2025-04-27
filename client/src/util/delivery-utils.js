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

