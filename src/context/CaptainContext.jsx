import React, { createContext, useState } from "react";
import axios from "../utils/axios";

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  // Initialize captain state from localStorage
  const [captain, setCaptain] = useState(() => {
    const storedCaptain = localStorage.getItem("captain");
    if (storedCaptain) {
      try {
        return JSON.parse(storedCaptain);
      } catch (error) {
        console.error("Failed to parse stored captain:", error);
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCaptain = (captainData) => {
    if (captainData) {
      localStorage.setItem("captain", JSON.stringify(captainData));
    } else {
      localStorage.removeItem("captain");
    }
    setCaptain(captainData);
  };

  const logout = async () => {
    try {
      // Call logout API
      await axios.get("/captain/logout");

      // Clear all captain-related data
      localStorage.removeItem("captainToken");
      localStorage.removeItem("captain");
      localStorage.removeItem("userType");
      localStorage.removeItem("activeToken");

      // Clear captain from state
      setCaptain(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const value = {
    captain,
    setCaptain,
    updateCaptain,
    isLoading,
    setIsLoading,
    error,
    setError,
    logout,
  };

  return (
    <CaptainDataContext.Provider value={value}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
