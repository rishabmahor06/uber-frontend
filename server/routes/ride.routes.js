const express = require("express");
const router = express.Router();
const { body, query, param } = require("express-validator");
const rideController = require("../controllers/ride.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const coord = (prefix) => [
  body(`${prefix}.lat`).isFloat().withMessage(`invalid ${prefix} latitude`),
  body(`${prefix}.lng`).isFloat().withMessage(`invalid ${prefix} longitude`),
];

router.post(
  "/create",
  authMiddleware.authUser,
  body("pickup").isString().isLength({ min: 3 }).withMessage("invalid pickup address"),
  body("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("invalid destination address"),
  ...coord("pickupCoords"),
  ...coord("destinationCoords"),
  body("vehicleType")
    .isIn(["car", "auto", "motorcycle", "moto"])
    .withMessage("invalid vehicleType"),
  rideController.createRide
);

router.get(
  "/get-fare",
  authMiddleware.authUser,
  query("pickupLat").isFloat().withMessage("invalid pickup"),
  query("pickupLng").isFloat().withMessage("invalid pickup"),
  query("destLat").isFloat().withMessage("invalid destination"),
  query("destLng").isFloat().withMessage("invalid destination"),
  rideController.getFare
);

// public price quote (used by the landing page before login)
router.get(
  "/estimate",
  query("pickupLat").isFloat().withMessage("invalid pickup"),
  query("pickupLng").isFloat().withMessage("invalid pickup"),
  query("destLat").isFloat().withMessage("invalid destination"),
  query("destLng").isFloat().withMessage("invalid destination"),
  rideController.getFare
);

router.post(
  "/confirm",
  authMiddleware.authCaptain,
  body("rideId").isMongoId().withMessage("invalid rideId"),
  rideController.confirmRide
);

router.get(
  "/start-ride",
  authMiddleware.authCaptain,
  query("rideId").isMongoId().withMessage("invalid rideId"),
  query("otp").isLength({ min: 6, max: 6 }).withMessage("invalid otp"),
  rideController.startRide
);

router.post(
  "/start-ride",
  authMiddleware.authCaptain,
  body("rideId").isMongoId().withMessage("invalid rideId"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("invalid otp"),
  rideController.startRide
);

router.post(
  "/end-ride",
  authMiddleware.authCaptain,
  body("rideId").isMongoId().withMessage("invalid ride id "),
  rideController.endRide
);

router.post(
  "/cancel",
  authMiddleware.authUser,
  body("rideId").isMongoId().withMessage("invalid rideId"),
  rideController.cancelRide
);

router.get("/active", authMiddleware.authUser, rideController.activeRideUser);
router.get(
  "/active-captain",
  authMiddleware.authCaptain,
  rideController.activeRideCaptain
);

// keep last: a catch-all id route would otherwise shadow /active, /estimate ...
router.get(
  "/:id",
  authMiddleware.authUser,
  param("id").isMongoId().withMessage("invalid ride id"),
  rideController.getRideForUser
);

module.exports = router;
