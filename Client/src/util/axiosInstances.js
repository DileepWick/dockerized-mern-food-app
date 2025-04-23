import axios from 'axios';

// Create an instance of axios for the authentication service
const authService = axios.create({
  baseURL: 'http://localhost:30000/api', // Change this to your backend URL //Change this to 3000 fro when dev
  withCredentials: true, // Ensures cookies (JWT) are sent with requests
});

const productsService = axios.create({
  baseURL: 'http://localhost:8099/api',
  withCredentials: true,
});

const restaurantService = axios.create({
  baseURL: 'http://localhost:30001/api', //Change this to 3001 fro when dev
  withCredentials: true,
});

export { authService, productsService, restaurantService };
