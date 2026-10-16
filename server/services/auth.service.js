const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

const MODELS = { user: userModel, captain: captainModel };

// Direct database check used by NextAuth: finds the account in MongoDB and
// compares the bcrypt hash. Throws an Error whose message is shown to the user.
module.exports.verifyCredentials = async (role, rawEmail, password) => {
  const model = MODELS[role];
  if (!model) throw new Error("Unknown account type");

  const email = String(rawEmail || "").trim().toLowerCase();
  if (!email || !password) throw new Error("Email and password are required");

  const account = await model.findOne({ email }).select("+password");
  if (!account) throw new Error("Invalid email or password");

  const matches = await bcrypt.compare(String(password), account.password);
  if (!matches) throw new Error("Invalid email or password");

  const profile = account.toObject();
  delete profile.password;
  return { token: account.generateAuthToken(), profile };
};
