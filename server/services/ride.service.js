const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const mapService = require("./maps.service");
const crypto = require("crypto");

const VEHICLE_TYPES = ["car", "auto", "motorcycle"];

const baseFare = { auto: 20, car: 40, motorcycle: 10 };
const perKmRate = { auto: 7, car: 12, motorcycle: 8 };
const perMinRate = { auto: 2, car: 3, motorcycle: 1.5 };

const isPoint = (p) =>
  p && isFinite(parseFloat(p.lat)) && isFinite(parseFloat(p.lng));
const point = (p) => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) });

// Fares for every vehicle type from the real road distance / duration (OSRM).
async function getFare(pickupCoords, destinationCoords) {
  if (!isPoint(pickupCoords) || !isPoint(destinationCoords)) {
    throw new Error("Pickup and destination coordinates are required");
  }
  const route = await mapService.getRoute(
    point(pickupCoords),
    point(destinationCoords)
  );
  const km = route.distance.value / 1000;
  const mins = route.duration.value / 60;
  const fare = {};
  for (const type of VEHICLE_TYPES) {
    fare[type] = Math.round(
      baseFare[type] + km * perKmRate[type] + mins * perMinRate[type]
    );
  }
  return { fare, ...route };
}
module.exports.getFare = getFare;

function getOtp(digits) {
  return crypto
    .randomInt(Math.pow(10, digits - 1), Math.pow(10, digits))
    .toString();
}

module.exports.createRide = async ({
  pickup,
  destination,
  pickupCoords,
  destinationCoords,
  vehicleType,
  userId,
}) => {
  if (!pickup || !destination || !vehicleType || !userId) {
    throw new Error(
      "pickup, destination, vehicleType, and userId are required"
    );
  }
  if (!VEHICLE_TYPES.includes(vehicleType)) {
    throw new Error("invalid vehicle type");
  }
  const quote = await getFare(pickupCoords, destinationCoords);

  return rideModel.create({
    pickup,
    destination,
    pickupCoords: point(pickupCoords),
    destinationCoords: point(destinationCoords),
    otp: getOtp(6),
    fare: quote.fare[vehicleType],
    distance: quote.distance.value,
    duration: quote.duration.value,
    vehicleType,
    user: userId,
  });
};

const populated = (query) => query.populate("user").populate("captain");

// Atomic: only one captain can take a pending ride.
module.exports.confirmRide = async (rideId, captain) => {
  if (!rideId) throw new Error("rideId are required");
  const updated = await rideModel.findOneAndUpdate(
    { _id: rideId, status: "pending" },
    { status: "accepted", captain: captain._id },
    { new: true }
  );
  if (!updated) {
    const err = new Error("Ride is no longer available");
    err.status = 409;
    throw err;
  }
  await captainModel.findByIdAndUpdate(captain._id, { status: "on_ride" });
  return populated(rideModel.findById(rideId)).select("+otp");
};

module.exports.startRide = async (rideId, otp, captain) => {
  if (!rideId || !otp) throw new Error("rideId and otp are required");
  const ride = await populated(
    rideModel.findOne({ _id: rideId, captain: captain._id })
  ).select("+otp");
  if (!ride) throw new Error("Ride not found");
  if (ride.status !== "accepted") throw new Error("Ride not accepted yet");
  if (ride.otp !== otp) throw new Error("Invalid OTP");
  ride.status = "ongoing";
  await ride.save();
  return ride;
};

module.exports.endRide = async (rideId, captain) => {
  if (!rideId) throw new Error("rideId is required");
  const ride = await populated(
    rideModel.findOne({ _id: rideId, captain: captain._id })
  );
  if (!ride) throw new Error("Ride not found");
  if (ride.status !== "ongoing") throw new Error("Ride not started yet");
  ride.status = "completed";
  await ride.save();
  await captainModel.findByIdAndUpdate(captain._id, { status: "available" });
  return ride;
};

module.exports.cancelRide = async (rideId, userId) => {
  const ride = await populated(
    rideModel.findOne({ _id: rideId, user: userId })
  );
  if (!ride) throw new Error("Ride not found");
  if (!["pending", "accepted"].includes(ride.status)) {
    throw new Error("Ride can no longer be cancelled");
  }
  ride.status = "cancelled";
  await ride.save();
  if (ride.captain) {
    await captainModel.findByIdAndUpdate(ride.captain._id, {
      status: "available",
    });
  }
  return ride;
};

const ACTIVE = ["pending", "accepted", "ongoing"];
module.exports.activeRideForUser = (userId) =>
  populated(
    rideModel.findOne({ user: userId, status: { $in: ACTIVE } }).sort({ _id: -1 })
  ).select("+otp");

module.exports.activeRideForCaptain = (captainId) =>
  populated(
    rideModel
      .findOne({ captain: captainId, status: { $in: ["accepted", "ongoing"] } })
      .sort({ _id: -1 })
  );

// Rider polling: any status (so completed / cancelled are visible), with OTP for the rider.
module.exports.rideForUser = (rideId, userId) =>
  populated(rideModel.findOne({ _id: rideId, user: userId })).select("+otp");

// Open requests a captain can accept: pending, same vehicle type, recent, nearby.
const REQUEST_MAX_AGE_MS = 10 * 60 * 1000;
module.exports.pendingRidesFor = async (captain, position, nearbyKm = 25) => {
  const rides = await rideModel
    .find({
      status: "pending",
      vehicleType: captain.vehicle?.vehicleType,
      createdAt: { $gte: new Date(Date.now() - REQUEST_MAX_AGE_MS) },
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("user", "fullname");
  if (!position) return rides;
  return rides.filter(
    (r) => !r.pickupCoords || mapService.haversineKm(position, r.pickupCoords) <= nearbyKm
  );
};
