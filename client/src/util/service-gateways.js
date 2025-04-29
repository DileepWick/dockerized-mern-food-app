// client/src/api/services.js
import axios from 'axios';

// Base URL of the API Gateway
const GATEWAY_BASE_URL = 'http://localhost:30007/api';

// Create axios instances routed through API Gateway
const authService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/auth`,
  withCredentials: true,
});

const deliveryService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/delivery`,
  withCredentials: true,
});

const notificationService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/notify`,
  withCredentials: true,
});

const orderService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/order`,
  withCredentials: true,
});

const paymentService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/payment`,
  withCredentials: true,
});

const restaurantService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/restaurant`,
  withCredentials: true,
});

const menuService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/menu`,
  withCredentials: true,
});

const userManagementService = axios.create({
  baseURL: `${GATEWAY_BASE_URL}/users`,
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
  menuService,
};
