import axios from "axios";

// Create an instance of axios for the authentication service
const authService = axios.create({
  baseURL: "http://auth-service:3000/api",
  withCredentials: true, 
});

// Create an instance of axios for the restaurant service
const restaurantService = axios.create({
  baseURL: "http://restaurant-service:3005/api",
  withCredentials: true, 
});

export default authService;
export { restaurantService };