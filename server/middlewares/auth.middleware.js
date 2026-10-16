const { JsonWebTokenError } = require("jsonwebtoken");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklistToken.model");
const captainModel = require("../models/captain.model");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token: token });

  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded._id);

    // the account must still exist in the database on every request
    if (!user) {
      return res
        .status(401)
        .json({ message: "Account not found. Please log in again." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: `Unauthorized ${error.message}` });
  }
};

module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token: token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const captain = await captainModel.findById(decoded._id);
    if (!captain) {
      return res
        .status(401)
        .json({ message: "Account not found. Please log in again." });
    }
    req.captain = captain;
    return next();
  } catch (error) {
    res.status(401).json({ message: "unauthorized" });
  }
};
