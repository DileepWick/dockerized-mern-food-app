import axios from "axios";

// Create an instance of axios for the authentication service
const authService = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, 
});

const orderService = axios.create({
  baseURL: "http://localhost:3003/api",
  withCredentials: true,
});






export {authService,orderService};
