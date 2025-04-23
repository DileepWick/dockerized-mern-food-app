import axios from 'axios';

// Create an instance of axios for the authentication service
const authService = axios.create({
  baseURL: 'http://auth-service:3000/api', // Change this to your backend URL
  withCredentials: true, // Ensures cookies (JWT) are sent with requests
});

const productsService = axios.create({
  baseURL: 'http://localhost:8099/api',
  withCredentials: true,
});

const restaurantService = axios.create({
  baseURL: 'http://localhost:8156/api',
  withCredentials: true,
});

export { authService, productsService, restaurantService };
