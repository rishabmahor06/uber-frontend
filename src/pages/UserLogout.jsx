import React from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const UserLogout = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  // backend exposes logout as GET and expects Authorization header
  axios
    .get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.status === 200) {
        // clear persisted user info
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/userlogin");
      }
    });
  return <div>UserLogout</div>;
};

export default UserLogout;
