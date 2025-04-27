import { orderService } from "./axiosInstances.js";

export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const response = await orderService.patch(
      `/orders/${orderId}/status`,
      { status },
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(
        error.response.data.message || "Failed to update order status"
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response received from order service");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error setting up order status update request");
    }
  }
};