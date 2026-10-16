const mapService = require("../services/maps.service");
const { validationResult } = require("express-validator");

const bad = (res, error) => res.status(400).json({ error: error.array() });

module.exports.getCordinates = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return bad(res, error);
  try {
    res
      .status(200)
      .json(await mapService.getAddressCordinate(req.query.address));
  } catch (err) {
    res.status(404).json({ message: "coordinate not found" });
  }
};

module.exports.getAutoCompleteSuggestions = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return bad(res, error);
  try {
    const { input, lat, lng } = req.query;
    res
      .status(200)
      .json(await mapService.getAutoCompleteSuggestions(input, { lat, lng }));
  } catch (err) {
    console.error("suggestions error:", err.message);
    res
      .status(502)
      .json({ message: "Location search is unavailable right now" });
  }
};

module.exports.reverse = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return bad(res, error);
  try {
    res
      .status(200)
      .json(await mapService.reverseGeocode(req.query.lat, req.query.lng));
  } catch (err) {
    res.status(404).json({ message: "Address not found for this location" });
  }
};

module.exports.getRoute = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) return bad(res, error);
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;
    const route = await mapService.getRoute(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng }
    );
    res.status(200).json(route);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
