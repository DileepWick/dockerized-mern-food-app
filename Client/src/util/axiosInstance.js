import axios from "axios";

    const axiosInstance = axios.create({
      baseURL: "/auth-service", // Change this to your backend URL
      withCredentials: true, // Ensures cookies (JWT) are sent with requests
    });

    export default axiosInstance;
