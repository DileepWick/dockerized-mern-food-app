import express from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  getRestaurantByOwnerId,
} from '../controllers/restaurantController.js';


import { getUploadSignature } from '../controllers/cloudinaryController.js';

const router = express.Router();

// Cloudinary route
router.get('/cloudinary/signature', getUploadSignature);


// Restaurant routes
router.post('/', createRestaurant);
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.put('/:id', updateRestaurant);
router.get('/owner/:id', getRestaurantByOwnerId);

export default router;
