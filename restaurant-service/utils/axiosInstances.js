import axios from 'axios';

// Create an instance of axios for the authentication service
const authService = axios.create({
  baseURL: 'http://localhost:3000/api', // Change this to http://localhost:3000 when dev
  withCredentials: true,
});

export default authService;
