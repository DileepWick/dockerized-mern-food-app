// utils/validateToken.js
import axios from 'axios';

// This function validates the JWT token by sending it to the Auth Service
export const validateToken = async (token) => {
    try {
      const response = await axios.post(
        'http://localhost:8098/api/auth/validate-token', // URL of the validate endpoint in the Auth Service
        { token }, // Send token in the request body
      );
      console.log("Token validation response:", response.data); // Log the response for debugging
      if (response.status !== 200) {
        throw new Error("Token validation failed");
      }
      return response.data.user.id;  // This will contain user data if token is valid
    } catch (error) {
      throw new Error(error.response?.data?.message || "Invalid or expired token");
    }
  };
  
  export default validateToken;