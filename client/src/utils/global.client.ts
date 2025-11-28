import axios from "axios";
import { getStorage, clearStorage } from "./storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const GLOBAL_CLIENT = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token from localStorage
GLOBAL_CLIENT.interceptors.request.use(
  (config) => {
    // Get token from localStorage using utility
    const token = getStorage("figma_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
GLOBAL_CLIENT.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear tokens and redirect to login
      clearStorage("figma_access_token");
      clearStorage("figma_refresh_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default GLOBAL_CLIENT;
