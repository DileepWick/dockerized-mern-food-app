import axios from "axios";

// Create an instance of axios for the authentication service
const authService = axios.create({
  baseURL: "http://localhost:3000/api", // Change this to your backend URL
  withCredentials: true, // Ensures cookies (JWT) are sent with requests
});

const deliveryService = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,
});

const notificationService = axios.create({
  baseURL: "http://localhost:3002/api",
  withCredentials: true,
});

const orderService = axios.create({
  baseURL: "http://localhost:3003/api",
  withCredentials: true,
});

const paymentService = axios.create({
  baseURL: "http://localhost:3004/api",
  withCredentials: true,
});

const restaurantService = axios.create({
  baseURL: "http://localhost:3005/api",
  withCredentials: true,
});

const userManagementService = axios.create({
  baseURL: "http://localhost:3006/api",
  withCredentials: true,
});

export {
  authService,
  deliveryService,
  restaurantService,
  notificationService,
  orderService,
  paymentService,
  userManagementService,
};
