const blacklistTokenModel = require("../models/blacklistToken.model");
const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

module.exports.registerCaptain = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  const { fullname, password, vehicle } = req.body;
  const email = String(req.body.email).trim().toLowerCase();

  try {
    // always check the database for an existing account first
    const isCaptainAlreadyExist = await captainModel.findOne({ email });
    if (isCaptainAlreadyExist) {
      return res
        .status(400)
        .json({ message: "A captain account with this email already exists" });
    }

    const hashPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
      firstname: fullname.firstname,
      lastname: fullname.lastname || undefined,
      email,
      password: hashPassword,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });

    const token = captain.generateAuthToken();
    res.status(200).json({ token, captain });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ message: "A captain account with this email already exists" });
    }
    if (error?.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: Object.values(error.errors)[0].message });
    }
    console.error("Captain register error:", error);
    res.status(500).json({ message: "Could not create the account" });
  }
};

module.exports.loginCaptain = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.array(),
      });
    }

    const { password } = req.body;
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find captain with password
    const captain = await captainModel.findOne({ email }).select("+password");
    console.log("Captain found:", captain ? "Yes" : "No");

    if (!captain) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password using bcrypt directly
    const isMatch = await bcrypt.compare(password, captain.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token and sanitize captain object
    const token = captain.generateAuthToken();
    const captainResponse = captain.toObject();
    delete captainResponse.password;

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Set authorization header
    res.setHeader("Authorization", `Bearer ${token}`);

    // Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      captain: captainResponse,
    });
  } catch (error) {
    console.error("Captain login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports.getCaptainProfile = async (req, res, next) => {
  res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blacklistTokenModel.create({ token });

  res.clearCookie("token");
  res.status(200).json({ message: "Logout successfully" });
};
