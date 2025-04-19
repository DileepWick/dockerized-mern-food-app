import axios from "axios";

export const validateToken = async (token) => {

  
  try {
    const response = await axios.post(
      'http://localhost:8098/api/auth/validate-token',
      { token } // 👈 Send token in body
    );
    return response.data.user; // Contains userId and role
  } catch (error) {
    console.error("Token validation error:", error.response?.data?.message || error.message);
    return null;
  }
};
