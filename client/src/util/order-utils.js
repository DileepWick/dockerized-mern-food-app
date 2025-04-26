import { orderService } from './service-gateways.js'; // Import centralized API instance

// Get orders by postal code from order service (NO STATUS FILTER ANYMORE)
export const getOrdersByPostalCode = async (postalCode) => {
  try {
    console.log("Fetching orders for postal code:", postalCode); // Debug log
    const response = await orderService.get(`/orders/postal-code/${postalCode}`);
    console.log("Fetched orders:", response.data); // Debug log
    return response.data; // Contains array of orders
  } catch (error) {
    console.error("Get orders by postal code error:", error.response?.data?.message || error.message);
    return null;
  }
};
