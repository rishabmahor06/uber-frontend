"use client";
import React from "react";
import { signOut } from "next-auth/react";

const LogoutButton = ({ userType = "user" }) => {
  const handleLogout = () => {
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
