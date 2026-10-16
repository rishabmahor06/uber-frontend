"use client";
import React, { useContext } from "react";
import { signOut } from "next-auth/react";
import { SocketContext } from "../context/SocketContext";

const LogoutButton = ({ userType = "user" }) => {
  const { socket } = useContext(SocketContext);

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    signOut({
      callbackUrl: userType === "user" ? "/userlogin" : "/captainlogin",
    });
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
