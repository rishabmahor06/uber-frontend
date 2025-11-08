import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.socket?.connected) return;

    const SOCKET_URL =
      import.meta.env.VITE_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const isProduction = (SOCKET_URL || "").includes("vercel.app");

    this.socket = io(SOCKET_URL || undefined, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      secure: isProduction,
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      auth: {
        token: localStorage.getItem("token"),
      },
      withCredentials: true,
    });

    this.setupConnectionHandlers();
  }

  setupConnectionHandlers() {
    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.reconnectAttempts = 0;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.handleReconnect();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        this.connect();
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnection attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        this.connect();
      }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000));
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected. Attempting to reconnect...");
      this.connect();
      return;
    }
    this.socket.emit(event, data);
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
    this.eventHandlers.set(event, callback);
  }

  off(event) {
    if (!this.socket) return;
    const handler = this.eventHandlers.get(event);
    if (handler) {
      this.socket.off(event, handler);
      this.eventHandlers.delete(event);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
