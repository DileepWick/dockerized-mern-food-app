import express from 'express';
import { getUserById } from '../controllers/userController.js';
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get user by ID route
router.get('/:id',verifyToken, getUserById);

export default router;