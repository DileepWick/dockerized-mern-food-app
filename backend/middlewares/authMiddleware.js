import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

  const token = req.cookies.token; // Get token from cookies
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token
    req.user = decoded; // Attach decoded user data to request object
    next(); // Proceed to the next middleware (getLoggedInUser)
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
