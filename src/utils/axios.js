import axios from "axios";

// Configure axios defaults
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

// Create axios instance with baseURL and default config
const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to attach Authorization header with the correct token
instance.interceptors.request.use(
  (config) => {
    // Get the active token type
    const activeTokenType = localStorage.getItem("activeToken") || "token";
    const token = localStorage.getItem(activeTokenType);

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Get the active token type
        const activeTokenType = localStorage.getItem("activeToken") || "token";
        const userType = localStorage.getItem("userType");

        // Clear invalid credentials
        localStorage.removeItem(activeTokenType);
        localStorage.removeItem(userType === "captain" ? "captain" : "user");
        localStorage.removeItem("activeToken");
        localStorage.removeItem("userType");

        // Redirect to appropriate login page
        const loginPath =
          userType === "captain" ? "/captainlogin" : "/userlogin";
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath;
        }
      }

      // Extract error message from response
      const message = error.response.data?.message || "An error occurred";
      error.message = message;
    }

    return Promise.reject(error);
  }
);

export default instance;
