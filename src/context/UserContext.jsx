import React, { createContext, useState } from "react";
import axios from "../utils/axios";

export const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to get user data from localStorage
    const storedUser = localStorage.getItem("user");
    console.log(storedUser);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
    return null; // Return null if no user data found
  });

  // wrapper to keep localStorage in sync when user changes
  const setUserAndPersist = (newUser) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Failed to persist user to localStorage:", err);
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await axios.get("/users/logout");

      // Clear all user-related data
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      localStorage.removeItem("activeToken");

      // Clear user from state
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <UserDataContext.Provider
      value={{ user, setUser: setUserAndPersist, logout }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
