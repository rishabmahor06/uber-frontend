const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const mapController = require("../controllers/map.Controller");
const { query } = require("express-validator");

const num = (name) => query(name).isFloat();

router.get(
  "/get-cordinates",
  query("address").isString().isLength({ min: 3 }),
  authMiddleware.authUser,
  mapController.getCordinates
);

router.get(
  "/get-suggestions",
  query("input").isString().isLength({ min: 2 }),
  mapController.getAutoCompleteSuggestions
);

router.get("/reverse", num("lat"), num("lng"), mapController.reverse);

router.get(
  "/route",
  num("fromLat"),
  num("fromLng"),
  num("toLat"),
  num("toLng"),
  mapController.getRoute
);

module.exports = router;
