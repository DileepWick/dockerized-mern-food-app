import { orderService } from './service-gateways.js'; // Import centralized API instance

// Get orders by postal code from order service
export const getOrdersByPostalCode = async (postalCode, status = null) => {
  try {
    const query = status ? `?status=${status}` : ""; // Add status if provided
    const response = await orderService.get(
      `/orders/postal-code/${postalCode}${query}`
    );
    return response.data; // Contains array of orders
  } catch (error) {
    console.error("Get orders by postal code error:", error.response?.data?.message || error.message);
    return null;
  }
};
