import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import PropTypes from "prop-types";
import axios from "../utils/axios";

const UserProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userType = localStorage.getItem("userType");
    const storedUser = localStorage.getItem("user");

    // If we already have a verified user in context, skip verification
    if (user && user._id) {
      setIsLoading(false);
      return;
    }

    if (!token || userType !== "user") {
      // Clear all user-related data
      localStorage.removeItem("userToken");
      localStorage.removeItem("userType");
      localStorage.removeItem("user");
      localStorage.removeItem("activeToken");
      setIsLoading(false);
      navigate("/userlogin", { replace: true });
      return;
    }

    // If we have stored user data and no user in context, set it
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }

    // Only verify with server if we don't have user data
    const verifyUser = async () => {
      try {
        const res = await axios.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          throw new Error("Invalid profile response structure");
        }
      } catch (err) {
        console.error("User profile verification failed:", err);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("user");
        localStorage.removeItem("activeToken");
        navigate("/userlogin", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [navigate, setUser]); // Remove user from dependencies to prevent loops

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
