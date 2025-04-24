import express from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  getRestaurantByOwnerId,
} from '../controllers/restaurantController.js';

import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemsByRestaurantId,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuItemController.js';

import { getUploadSignature } from '../controllers/cloudinaryController.js';

const router = express.Router();

// Restaurant routes
router.post('/', createRestaurant);
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.put('/:id', updateRestaurant);
router.get('/owner/:id', getRestaurantByOwnerId);

// Cloudinary route
router.get('/cloudinary/signature', getUploadSignature);

// Menu item routes
router.post('/menu-items', createMenuItem);
router.get('/menu-items', getAllMenuItems);
router.get('/menu-items/:id', getMenuItemById);
router.get('/menu-items/restaurant/:id', getMenuItemsByRestaurantId);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);

export default router;
