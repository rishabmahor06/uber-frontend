import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";
const isProduction = (SOCKET_URL || "").includes("vercel.app");
const isDev = SOCKET_URL.includes("localhost");

console.log("Attempting Socket.IO connection to:", SOCKET_URL);

// Create socket instance with robust error handling
const socket = io(SOCKET_URL, {
  path: "/socket.io/", // Use default Socket.IO path
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 60000,
  auth: {
    token: localStorage.getItem("token"),
  },
  withCredentials: true,
  autoConnect: false,
  forceNew: true,
  secure: true,
});

const SocketProvider = ({ children }) => {
  useEffect(() => {
    const setupSocket = async () => {
      // Connection event handlers
      socket.on("connect", () => {
        console.log("Socket connected successfully");
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        // Always use WebSocket transport
        socket.io.opts.transports = ["websocket"];

        // Attempt to reconnect after a delay
        setTimeout(() => {
          socket.connect();
        }, 1000);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          // Server disconnected us, try to reconnect
          socket.connect();
        }
      });

      socket.io.on("reconnect_attempt", (attempt) => {
        console.log(`Socket reconnection attempt ${attempt}`);
        // Reset transports on new attempt
        socket.io.opts.transports = isDev
          ? ["websocket"]
          : ["websocket", "polling"];
      });

      socket.io.on("reconnect", (attempt) => {
        console.log(`Socket reconnected after ${attempt} attempts`);
      });

      socket.io.on("reconnect_error", (error) => {
        console.error("Socket reconnection error:", error);
      });

      socket.io.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Start connection
      socket.connect();
    };

    setupSocket();

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("error");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
