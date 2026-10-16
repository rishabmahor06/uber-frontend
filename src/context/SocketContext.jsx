"use client";
import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

// Same origin as the Next.js server (Socket.IO is attached to it).
const socket = io({
  path: "/socket.io",
  transports: ["websocket", "polling"],
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
