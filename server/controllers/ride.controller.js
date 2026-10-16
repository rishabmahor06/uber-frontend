const rideService = require("../services/ride.service");
const mapsService = require("../services/maps.service");
const { validationResult } = require("express-validator");
const { sendMessageToSocket } = require("../socket");
const captainModel = require("../models/captain.model");

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

    // notify available captains of the same vehicle type that are close enough
    const candidates = await mapsService.getAvailableCaptains(vehicleType);
    const pickupPoint = ride.pickupCoords;
    const nearby = candidates.filter((c) => {
      if (c.location?.ltd == null || c.location?.lng == null) return true;
      return (
        mapsService.haversineKm(pickupPoint, {
          lat: c.location.ltd,
          lng: c.location.lng,
        }) <= NEARBY_KM
      );
    });

    const payload = withoutOtp(ride);
    payload.user = {
      _id: req.user._id,
      fullname: req.user.fullname,
    };
    nearby.forEach((captain) =>
      sendMessageToSocket(captain.socketId, { event: "new-ride", data: payload })
    );

    res.status(201).json({ ...withoutOtp(ride), notified: nearby.length });
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

    // rider receives the OTP; everybody else only learns the ride is taken
    sendMessageToSocket(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });
    const others = await mapsService.getAvailableCaptains(ride.vehicleType);
    others.forEach((c) =>
      sendMessageToSocket(c.socketId, {
        event: "ride-taken",
        data: { rideId: String(ride._id) },
      })
    );

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
    sendMessageToSocket(ride.user.socketId, {
      event: "ride-started",
      data: withoutOtp(ride),
    });
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
    sendMessageToSocket(ride.user.socketId, {
      event: "ride-ended",
      data: withoutOtp(ride),
    });
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
    if (ride.captain) {
      sendMessageToSocket(ride.captain.socketId, {
        event: "ride-cancelled",
        data: { rideId: String(ride._id) },
      });
    } else {
      const captains = await mapsService.getAvailableCaptains(ride.vehicleType);
      captains.forEach((c) =>
        sendMessageToSocket(c.socketId, {
          event: "ride-taken",
          data: { rideId: String(ride._id) },
        })
      );
    }
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
