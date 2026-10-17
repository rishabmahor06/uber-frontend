const axios = require("axios");
const crypto = require("crypto");
const rideModel = require("../models/ride.model");

// Razorpay Orders API over plain HTTPS (no SDK needed, works on serverless).
const keyId = () => process.env.RAZORPAY_KEY_ID;
const keySecret = () => process.env.RAZORPAY_KEY_SECRET;

const httpError = (message, status) => Object.assign(new Error(message), { status });

module.exports.isConfigured = () => Boolean(keyId() && keySecret());
module.exports.publicKey = keyId;

// Creates (or reuses) a Razorpay order for a completed, unpaid ride of this rider.
module.exports.createOrder = async (rideId, userId) => {
  if (!module.exports.isConfigured()) {
    throw httpError("Online payments are not configured", 503);
  }
  const ride = await rideModel.findOne({ _id: rideId, user: userId });
  if (!ride) throw httpError("Ride not found", 404);
  if (ride.status !== "completed") throw httpError("Ride is not completed yet", 400);
  if (ride.paymentStatus === "paid") throw httpError("Ride is already paid", 409);

  const { data: order } = await axios.post(
    "https://api.razorpay.com/v1/orders",
    {
      amount: Math.round(ride.fare * 100), // paise
      currency: "INR",
      receipt: `ride_${ride._id}`,
      notes: { rideId: String(ride._id) },
    },
    { auth: { username: keyId(), password: keySecret() }, timeout: 15000 }
  );

  ride.orderId = order.id;
  await ride.save();
  return { order, key: keyId(), ride };
};

// Verifies Razorpay's HMAC signature, then marks the ride as paid.
module.exports.verifyPayment = async (rideId, userId, payload) => {
  if (!module.exports.isConfigured()) {
    throw httpError("Online payments are not configured", 503);
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw httpError("Payment details are required", 400);
  }
  const ride = await rideModel.findOne({ _id: rideId, user: userId });
  if (!ride) throw httpError("Ride not found", 404);
  if (ride.orderId !== razorpay_order_id) throw httpError("Order does not match this ride", 400);

  const expected = crypto
    .createHmac("sha256", keySecret())
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw httpError("Payment verification failed", 400);
  }

  ride.paymentId = razorpay_payment_id;
  ride.signature = razorpay_signature;
  ride.paymentStatus = "paid";
  ride.paymentMethod = "online";
  await ride.save();
  return ride;
};

// Rider chooses to pay the captain directly.
module.exports.payByCash = async (rideId, userId) => {
  const ride = await rideModel.findOne({ _id: rideId, user: userId });
  if (!ride) throw httpError("Ride not found", 404);
  if (ride.status !== "completed") throw httpError("Ride is not completed yet", 400);
  if (ride.paymentStatus !== "paid") {
    ride.paymentMethod = "cash";
    await ride.save();
  }
  return ride;
};
