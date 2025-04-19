// routes/userRoutes.js
import { Router } from 'express';
import { registerUser, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = Router();

// Route to register a new user
router.post('/register', registerUser);

// Route to get all users
router.get('/', getAllUsers);

// Route to update user by ID
router.put('/:id', updateUser);

// Route to delete user by ID
router.delete('/:id', deleteUser);

export default router;
