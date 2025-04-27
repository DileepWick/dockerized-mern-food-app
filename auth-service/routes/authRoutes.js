import express from 'express';
import {
  loginUser,
  logoutUser,
  registerUser,
  validateToken,
} from '../controllers/authController.js';
import { getLoggedInUser } from '../utils/getLoggedInUser.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  getUserById,
  updateUserVerification,
  getAllUsers,
  deleteUserById,
} from '../controllers/userController.js';

const router = express.Router();

//Auth routes for Client
router.post('/login', loginUser); // Login
router.get('/me', verifyToken, getLoggedInUser); // Fetch logged-in user
router.post('/logout', verifyToken, logoutUser); // Logout
router.post('/register', registerUser); // Register

//Auth routes for internal services
router.post('/validate-token', validateToken); // Validate token

//user routes
router.get('/user/:id', verifyToken, getUserById);
router.patch('/user/:id/verify', verifyToken, updateUserVerification);
router.get('/users', verifyToken, getAllUsers);
router.delete('/user/:id', verifyToken, deleteUserById);

export default router;
