import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import PropTypes from "prop-types";

const UserProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token || userType !== "user") {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("user");
      setIsLoading(false);
      navigate("/userlogin", { replace: true });
      return;
    }

    // Try to get user data from localStorage if not in context
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to parse stored user data:", err);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          setIsLoading(false);
          navigate("/userlogin", { replace: true });
        }
      } else {
        // No user data found, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        setIsLoading(false);
        navigate("/userlogin", { replace: true });
      }
    } else {
      setIsLoading(false);
    }
  }, [user, setUser, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return children;
};

UserProtectWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserProtectWrapper;
