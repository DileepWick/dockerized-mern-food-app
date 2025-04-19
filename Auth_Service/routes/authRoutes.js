import express from "express";
import { loginUser ,logoutUser,registerUser} from "../controllers/authController.js";
import { getLoggedInUser } from "../utils/getLoggedInUser.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/login", loginUser); // Login
router.get("/me", verifyToken, getLoggedInUser); // Fetch logged-in user
router.post("/logout", verifyToken, logoutUser); // Logout
router.post("/register", registerUser); // Register

export default router;
