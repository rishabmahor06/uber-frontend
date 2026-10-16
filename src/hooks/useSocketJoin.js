"use client";
import { useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";

// Registers this browser's socket with the server as a user / captain.
// Re-joins on every (re)connect so the server always has the live socket id.
export default function useSocketJoin(userId, userType) {
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket || !userId) return;
    const join = () => socket.emit("join", { userId, userType });
    if (socket.connected) join();
    socket.on("connect", join);
    return () => {
      socket.off("connect", join);
    };
  }, [socket, userId, userType]);

  return socket;
}
