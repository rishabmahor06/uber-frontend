const mongoose = require("mongoose");

// The URI may omit the database name (then MongoDB silently uses "test"),
// so the database is always selected explicitly.
const DB_NAME = process.env.MONGO_DB || "uber";

// Serverless friendly: one cached connection promise per warm instance,
// connected lazily on the first request (never at import / build time).
const cache = globalThis.__mongooseCache || (globalThis.__mongooseCache = { promise: null });

const connectToDb = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, {
        dbName: DB_NAME,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => {
        console.log(`✅ Connected to MongoDB (database: ${m.connection.name})`);
        return m.connection;
      })
      .catch((err) => {
        cache.promise = null; // allow a retry on the next request
        console.error("❌ Error connecting to MongoDB:", err.message);
        throw err;
      });
  }
  return cache.promise;
};

module.exports = { connectToDb };
