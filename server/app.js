const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const { connectToDb } = require("./db/db");  // ✅ FIXED: Added destructuring
const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userModel = require("./models/user.model");

// Lazy, cached MongoDB connection: works on serverless hosts (Vercel) where every
// cold start is a fresh process, and never connects at import / build time.
app.use(async (req, res, next) => {
  try {
    await connectToDb();
    next();
  } catch (err) {
    res.status(503).json({ message: "Database is unavailable. Please try again." });
  }
});

// Apply bodyParser for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Body parser setup - only parse JSON for POST/PUT/PATCH requests
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    bodyParser.json({
      verify: (req, res, buf) => {
        try {
          JSON.parse(buf);
        } catch (e) {
          res.status(400).json({ message: "Invalid JSON" });
          throw new Error("Invalid JSON");
        }
      },
    })(req, res, next);
  } else {
    next();
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check for uptime monitors (UptimeRobot etc). Express answers HEAD for GET routes too.
// It really talks to MongoDB (ping + a tiny read) so the cluster counts it as activity.
app.get("/api/health", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const started = Date.now();
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected");
    }
    await mongoose.connection.db.admin().ping();
    await userModel.estimatedDocumentCount();
    res.status(200).json({
      status: "ok",
      database: { status: "up", name: mongoose.connection.name, latencyMs: Date.now() - started },
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: { status: "down", error: err.message },
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api/users", userRoutes);
app.use("/api/captain", captainRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/ride", rideRoutes);

// Error handler for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  next();
});

module.exports = app;
