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
    Navigate("/login"); // Redirect to login page after logout
 
    return true; // Logout successful
  } catch (error) {
    console.error("Logout failed:", error.response?.data?.message || error.message);
    return false;
  }
};


// ✅ Validate token function
export const checkTokenValidity = async () => {
  try {
    const response = await axiosInstance.post("/auth/validate-token", {}, { withCredentials: true });
    if (response.status !== 200) {
      alert("Token is invalid or expired. Please log in again.");
    }else if (response.status === 200) {
      alert("Token is valid. You are logged in.");
    }
    return response.data.user.userId; // Return token validity status
  } catch (error) {
    console.error("Token validation error:", error.response?.data?.message || error.message);
    return false; // Return false if token is invalid or an error occurs
  }
};