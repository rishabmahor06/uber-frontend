const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const { connectToDb } = require("./db/db");  // ✅ FIXED: Added destructuring
const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const bodyParser = require("body-parser");

// Connect to MongoDB on startup
connectToDb().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
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
