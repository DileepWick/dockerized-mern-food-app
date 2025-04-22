import authService from "../utils/axiosInstances.js"; // Import centralized API instance

// Validate token from auth service
export const validateToken = async (token) => {
  try {
    const response = await authService.post(
      '/auth/validate-token',
      { token } // 👈 Send token in body
    );
    return response.data.user; // Contains userId and role
  } catch (error) {
    console.error("Token validation error:", error.response?.data?.message || error.message);
    return null;
  }
};
