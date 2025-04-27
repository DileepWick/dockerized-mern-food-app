import { restaurantService } from "./service-gateways";

export const fetchRestaurantById = async (id) => {
    try {
      const response = await restaurantService.get(`restaurant/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      throw error;
    }
  };
  