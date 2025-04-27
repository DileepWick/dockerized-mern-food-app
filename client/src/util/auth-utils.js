import { authService } from './service-gateways.js'; // Import centralized API instance

// ✅ Get logged-in user
export const getLoggedInUser = async () => {
  try {
    const response = await authService.get('/me');
    return response.data; // Return user details
  } catch (error) {
    console.error(
      'Error fetching user:',
      error.response?.data?.message || error.message
    );
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
    await authService.post('/logout');
    Navigate('/login'); // Redirect to login page after logout

    return true; // Logout successful
  } catch (error) {
    console.error(
      'Logout failed:',
      error.response?.data?.message || error.message
    );
    return false;
  }
};

// ✅ Validate token function
export const checkTokenValidity = async () => {
  try {
    const response = await authService.post(
      '/validate-token',
      {},
      { withCredentials: true }
    );
    if (response.status !== 200) {
      alert('Token is invalid or expired. Please log in again.');
    } else if (response.status === 200) {
      alert('Token is valid. You are logged in.');
    }
    return response.data.user.userId; // Return token validity status
  } catch (error) {
    console.error(
      'Token validation error:',
      error.response?.data?.message || error.message
    );
    return false; // Return false if token is invalid or an error occurs
  }
};

// ✅ Get a user by ID
export const getUserById = async (userId) => {
  try {
    const response = await authService.get(`/user/${userId}`);
    return response.data; // Return user details
  } catch (error) {
    console.error(
      `Error fetching user with ID ${userId}:`,
      error.response?.data?.message || error.message
    );
    return null; // Return null if fetching fails
  }
};

//Register User

export const registerUser = async (userData) => {
  try {
    const {
      username,
      first_name,
      last_name,
      email,
      phone_number,
      password,
      role = 'user',
      address,
    } = userData;

    // Validate required fields based on the schema
    if (
      !username ||
      !first_name ||
      !last_name ||
      !email ||
      !phone_number ||
      !password
    ) {
      throw new Error('All required fields must be provided');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please provide a valid email address');
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone_number.replace(/[^\d]/g, ''))) {
      throw new Error('Please provide a valid phone number');
    }

    // Validate role if provided
    if (role && !['admin', 'user', 'seller', 'driver'].includes(role)) {
      throw new Error('Invalid role specified');
    }

    // Make API call to register endpoint
    const response = await authService.post('/register', {
      username,
      first_name,
      last_name,
      email,
      phone_number,
      password,
      role,
      address,
    });

    // Return the user data and token
    return {
      user: response.data.user,
      token: response.data.token,
      message: response.data.message,
    };
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data.message || 'Registration failed';

      // Handle specific error cases based on status code
      if (error.response.status === 400) {
        // Handle validation errors or duplicate user
        throw new Error(errorMessage);
      } else if (error.response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

// ✅ Get all users
export const fetchAllUsers = async () => {
  try {
    const response = await authService.get('/users');
    return response.data.users; // Return array of users
  } catch (error) {
    console.error(
      'Failed to fetch all users:',
      error.response?.data?.message || error.message
    );
    return [];
  }
};

// ✅ Approve (verify) a user
export const approveUser = async (userId) => {
  try {
    const response = await authService.patch(`/user/${userId}/verify`, {
      is_verified: true,
    });
    return response.data.user; // Return updated user
  } catch (error) {
    console.error(
      `Failed to approve user with ID ${userId}:`,
      error.response?.data?.message || error.message
    );
    return null;
  }
};

// ✅ Delete a user
export const deleteUser = async (userId) => {
  try {
    await authService.delete(`/user/${userId}`);
    return true;
  } catch (error) {
    console.error(
      `Failed to delete user with ID ${userId}:`,
      error.response?.data?.message || error.message
    );
    return false;
  }
};
