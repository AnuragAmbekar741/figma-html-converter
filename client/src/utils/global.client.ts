import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const GLOBAL_CLIENT = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This sends cookies automatically with every request
});

// Response interceptor for error handling
GLOBAL_CLIENT.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // User is not authenticated - cookies are missing or invalid
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default GLOBAL_CLIENT;
