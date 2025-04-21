import axios from "axios";

export const validateToken = async (token) => {
  try {
    const response = await axios.post(
      'http://auth-service:5000/api/auth/validate-token',
      { token }
    );
    return response.data.user;
  } catch (error) {
    console.error("Token validation error:");

    // Full error object for deep inspection
   // console.log("Full error object:", error);

    // Common error fields
    console.log("Error message:", error.message);

    if (error.response) {
      console.log("Error response status:", error.response.status);
      console.log("Error response data:", error.response.data);
      console.log("Error response headers:", error.response.headers);

      // Check specifically for 401 Unauthorized
      if (error.response.status === 401) {
        console.error("Unauthorized: Token is invalid or expired.");
        console.log("Possible causes: token expired, malformed, or missing user info.");
      }
    } else if (error.request) {
      console.log("No response received:", error.request);
    } else {
      console.log("Error in request setup:", error.config);
    }

    return null;
  }
};
