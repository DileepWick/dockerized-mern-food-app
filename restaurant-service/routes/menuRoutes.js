import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemsByRestaurantId,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuItemController.js';
import express from 'express';

const router = express.Router();

// Menu item routes
router.post('/menu-items', createMenuItem);
router.get('/menu-items', getAllMenuItems);
router.get('/menu-items/restaurant/:id', getMenuItemsByRestaurantId);
router.get('/menu-items/:id', getMenuItemById);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);

export default router;