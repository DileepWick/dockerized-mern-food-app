import authService from './axiosInstances.js'; // Import centralized API instance

// Validate token from auth service
export const validateToken = async (token) => {
  try {
    const response = await authService.post(
      '/auth/validate-token',
      { token } // 👈 Send token in body
    );
    return response.data.user; // Contains userId and role
  } catch (error) {
    console.error(
      'Token validation error:',
      error.response?.data?.message || error.message
    );
    return null;
  }
};

export const getFullUser = async (token) => {
  try {
    const response = await authService.get('/auth/me', {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    return response.data; // Full user object
  } catch (error) {
    console.error(
      'Failed to fetch full user:',
      error.response?.data?.message || error.message
    );
    return null;
  }
};
