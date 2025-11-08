import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "../utils/axios";
import PropTypes from "prop-types";

const CaptainProtectWrapper = ({ children }) => {
  const navigate = useNavigate();
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (!token || userType !== "captain") {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      setIsLoading(false);
      navigate("/captainlogin", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/captain/profile");

        if (res.data?.captain) {
          setCaptain(res.data.captain);
          setIsLoading(false);
        } else {
          throw new Error("Invalid profile response");
        }
      } catch (err) {
        console.error(
          "Captain profile fetch error:",
          err?.response?.data || err
        );
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        setIsLoading(false);
        navigate("/captainlogin", { replace: true });
      }
    };

    fetchProfile();
  }, [navigate, setCaptain]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return children;
};

CaptainProtectWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CaptainProtectWrapper;
