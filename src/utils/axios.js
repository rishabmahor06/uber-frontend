"use client";
import axios from "axios";
import { signOut } from "next-auth/react";
import { getAuthToken, getAuthRole } from "@/lib/authToken";

// Configure axios defaults
const BASE_URL = "/api";

// Create axios instance with baseURL and default config
const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to attach Authorization header with the correct token
instance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for API calls
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Only an expired/invalid session should log out; login attempts go through NextAuth.
      if (error.response.status === 401 && getAuthToken()) {
        const loginPath =
          getAuthRole() === "captain" ? "/captainlogin" : "/userlogin";
        signOut({ callbackUrl: loginPath });
      }

      // Extract error message from response
      const message = error.response.data?.message || "An error occurred";
      error.message = message;
    }

    return Promise.reject(error);
  }
);

export default instance;
