import express from "express";
import { loginUser ,logoutUser,registerUser ,validateToken} from "../controllers/authController.js";
import { getLoggedInUser } from "../utils/getLoggedInUser.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router();

//Auth routes for Client
router.post("/login", loginUser); // Login
router.get("/me", verifyToken, getLoggedInUser); // Fetch logged-in user
router.post("/logout", verifyToken, logoutUser); // Logout
router.post("/register", registerUser); // Register


//Auth routes for internal services
router.post("/validate-token", validateToken); // Validate token

export default router;
