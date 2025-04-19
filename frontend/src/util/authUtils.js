import axiosInstance from "./axiosInstance";

// ✅ Get logged-in user
export const getLoggedInUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data; // Return user details
  } catch (error) {
    console.error("Error fetching user:", error.response?.data?.message || error.message);
    return null; // Return null if user is not authenticated
  }
};

// ✅ Check if user is authorized based on role
export const isAuthorized = (user, allowedRoles) => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

// ✅ Logout function
export const logoutUser = async () => {
  try {
    await axiosInstance.post("/auth/logout");
    return true; // Logout successful
  } catch (error) {
    console.error("Logout failed:", error.response?.data?.message || error.message);
    return false;
  }
};
