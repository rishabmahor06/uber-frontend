const rideService = require("../services/ride.service");
const mapsService = require("../services/maps.service");
const { validationResult } = require("express-validator");

const NEARBY_KM = 25;

const fail = (res, error) => {
  const message = error?.message || "internal server error";
  const status =
    error?.status ||
    (/required|invalid|not found|not accepted|not started|cancelled/i.test(
      message
    )
      ? 400
      : 500);
  return res.status(status).json({ message });
};

// never expose the OTP to anyone but the rider
const withoutOtp = (ride) => {
  const obj = ride.toObject ? ride.toObject() : { ...ride };
  delete obj.otp;
  return obj;
};
module.exports.withoutOtp = withoutOtp;

// Realtime is done with short polling (works on serverless hosts such as Vercel):
//  - riders poll GET /api/ride/:id
//  - captains poll POST /api/captain/sync (which also lists open requests)

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, pickupCoords, destinationCoords } = req.body;
  let vehicleType = String(req.body.vehicleType || "").toLowerCase();
  if (vehicleType === "moto") vehicleType = "motorcycle";

  try {
    const ride = await rideService.createRide({
      pickup,
      destination,
      pickupCoords,
      destinationCoords,
      vehicleType,
      userId: req.user._id,
    });

    // how many online captains of this type are close enough to see the request
    const candidates = await mapsService.getAvailableCaptains(vehicleType);
    const notified = candidates.filter((c) => {
      if (c.location?.ltd == null || c.location?.lng == null) return true;
      return (
        mapsService.haversineKm(ride.pickupCoords, {
          lat: c.location.ltd,
          lng: c.location.lng,
        }) <= NEARBY_KM
      );
    }).length;

    res.status(201).json({ ...withoutOtp(ride), notified });
  } catch (error) {
    return fail(res, error);
  }
};

module.exports.getFare = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }
  const { pickupLat, pickupLng, destLat, destLng } = req.query;
  try {
    const quote = await rideService.getFare(
      { lat: pickupLat, lng: pickupLng },
      { lat: destLat, lng: destLng }
    );
    return res.status(200).json(quote);
  } catch (error) {
    return fail(res, error);
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const ride = await rideService.confirmRide(req.body.rideId, req.captain);
    res.status(200).json(withoutOtp(ride));
  } catch (error) {
    return fail(res, error);
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { rideId, otp } = req.method === "GET" ? req.query : req.body;
  try {
    const ride = await rideService.startRide(rideId, otp, req.captain);
    res.status(200).json(withoutOtp(ride));
  } catch (error) {
    return fail(res, error);
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const ride = await rideService.endRide(req.body.rideId, req.captain);
    res.status(200).json(withoutOtp(ride));
  } catch (error) {
    return fail(res, error);
  }
};

module.exports.cancelRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const ride = await rideService.cancelRide(req.body.rideId, req.user._id);
    res.status(200).json(withoutOtp(ride));
  } catch (error) {
    return fail(res, error);
  }
};

module.exports.activeRideUser = async (req, res) => {
  try {
    const ride = await rideService.activeRideForUser(req.user._id);
    res.status(200).json({ ride });
  } catch (error) {
    return fail(res, error);
  }
};

module.exports.activeRideCaptain = async (req, res) => {
  try {
    const ride = await rideService.activeRideForCaptain(req.captain._id);
    res.status(200).json({ ride: ride ? withoutOtp(ride) : null });
  } catch (error) {
    return fail(res, error);
  }
};

// Rider polls this: current status, assigned captain (with live location) and OTP.
module.exports.getRideForUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const ride = await rideService.rideForUser(req.params.id, req.user._id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json(ride);
  } catch (error) {
    return fail(res, error);
  }
};
