import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import { CaptainDataContext } from "../context/CaptainContext";
import { SocketContext } from "../context/SocketContext";

const LogoutButton = ({ userType = "user" }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const { updateCaptain } = useContext(CaptainDataContext);
  const { socket } = useContext(SocketContext);

  const handleLogout = () => {
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }

    // Clear authentication data
    localStorage.removeItem("token");

    // Clear user/captain data based on type
    if (userType === "user") {
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    } else {
      localStorage.removeItem("captain");
      updateCaptain(null);
      navigate("/captain-login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
