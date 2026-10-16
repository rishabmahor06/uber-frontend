// Single process: Next.js (UI) + Express API (/api/*) + Socket.IO (/socket.io)
const http = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { loadEnvConfig } = require("@next/env");

const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), dev);

const api = require("./server/app");
const { initializeSocket } = require("./server/socket");

// NextAuth checks credentials directly in MongoDB through this service
globalThis.__speedAuth = require("./server/services/auth.service");

const port = parseInt(process.env.PORT || "3000", 10);
const server = http.createServer();
const nextApp = next({ dev, httpServer: server, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  server.on("request", (req, res) => {
    if (req.url.startsWith("/api/") && !req.url.startsWith("/api/auth")) return api(req, res); // /api/auth/* = NextAuth
    if (req.url.startsWith("/socket.io")) return; // handled by socket.io
    return handle(req, res);
  });

  const io = new Server(server, {
    path: "/socket.io",
    cors: { origin: true, credentials: true },
    destroyUpgrade: false,
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e8,
  });
  initializeSocket(io);

  api.get("/api/socket/health", (req, res) => {
    res.json({ status: "ok", connections: io.engine.clientsCount, uptime: process.uptime() });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
