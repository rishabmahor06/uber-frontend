"use client";
import React, { useEffect } from "react";
import axios from "../utils/axios";
import { signOut } from "next-auth/react";

const UserLogout = () => {
  useEffect(() => {
    // blacklist the backend token, then end the NextAuth session
    axios
      .get("/users/logout")
      .catch((err) => console.error("Logout request failed:", err))
      .finally(() => signOut({ callbackUrl: "/userlogin" }));
  }, []);

  return <div>Logging out...</div>;
};

export default UserLogout;
