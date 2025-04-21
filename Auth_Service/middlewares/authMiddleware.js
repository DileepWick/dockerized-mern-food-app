import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  console.log("=== TOKEN VERIFICATION STARTED ===");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);
  
  // Check if token exists
  const token = req.cookies.token;
  console.log("Token from cookies:", token ? "Token present" : "No token found");
  
  if (!token) {
    console.log("Authentication failed: No token provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("Attempting to verify token...");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token successfully verified");
    console.log("Decoded payload:", { ...decoded, iat: decoded.iat, exp: decoded.exp });
    
    req.user = decoded;
    console.log("User attached to request");
    console.log("=== TOKEN VERIFICATION COMPLETED SUCCESSFULLY ===");
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    console.error("Error name:", error.name);
    console.log("=== TOKEN VERIFICATION FAILED ===");
    
    res.status(403).json({ message: "Invalid or expired token" });
  }
};