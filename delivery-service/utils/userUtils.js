import { authService } from "./axiosInstances.js";

// Get user by ID from user service
export const getUserById = async (userId) => {
  try {
    const response = await authService.get(
      `/users/${userId}`
    );
    return response.data.user; // Contains user data
  } catch (error) {
    console.error("Get user error:", error.response?.data?.message || error.message);
    return null;
  }
};