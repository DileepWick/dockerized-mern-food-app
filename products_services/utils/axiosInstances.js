import axios from "axios";

// Create an instance of axios for the authentication service
const authService = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL || "http://auth-service:3000", 
  withCredentials: true, 
  timeout: 10000, // Set a timeout of 10 seconds for requests
});



export default authService;