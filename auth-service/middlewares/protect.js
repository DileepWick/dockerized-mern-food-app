import { verifyToken } from "./authMiddleware.js"; // Assuming verifyToken is in the same directory

export const protect = (req, res, next) => {
  verifyToken(req, res, next);
};
