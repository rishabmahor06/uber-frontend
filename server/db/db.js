const mongoose = require("mongoose");

// The URI may omit the database name (then MongoDB silently uses "test"),
// so the database is always selected explicitly.
const DB_NAME = process.env.MONGO_DB || "uber";

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: DB_NAME });
    console.log(`✅ Connected to MongoDB (database: ${mongoose.connection.name})`);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = { connectToDb };
