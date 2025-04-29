// utils/menuService.js
import axios from 'axios';
import { restaurantService } from './axiosInstances.js';

// Get menu item details from restaurant service
export const getMenuItemDetails = async (menuItemId) => {
  try {
    const response = await restaurantService.get(`menu/menu-items/${menuItemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu item ${menuItemId}:`, error.message);
    throw new Error('Failed to fetch menu item details');
  }
};

//get restaurant details from restaurant service
export const getRestaurantDetails = async (restaurantId) => {
  try {
    const response = await restaurantService.get(`/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching restaurant ${restaurantId}:`, error.message);
    throw new Error('Failed to fetch restaurant details');
  }
};