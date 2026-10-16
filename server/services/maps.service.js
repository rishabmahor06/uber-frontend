const axios = require("axios");
const captainModel = require("../models/captain.model");

// OpenStreetMap stack: Photon (autocomplete), Nominatim (geocode/reverse), OSRM (routing).
const http = axios.create({
  timeout: 10000,
  headers: { "User-Agent": "SpeedCabApp/1.0", "Accept-Language": "en" },
});

const cache = new Map();
const TTL = 10 * 60 * 1000;
async function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;
  const value = await loader();
  cache.set(key, { value, exp: Date.now() + TTL });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return value;
}

const uniq = (parts) =>
  parts.filter(Boolean).filter((p, i, a) => a.indexOf(p) === i);

function fromPhoton(f) {
  const p = f.properties || {};
  const [lng, lat] = f.geometry.coordinates;
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  const title = p.name || street || p.city || p.state || "";
  const description = uniq([
    p.name,
    street,
    p.district || p.locality,
    p.city || p.county,
    p.state,
    p.postcode,
    p.country,
  ]).join(", ");
  return {
    place_id: `${p.osm_type}${p.osm_id}`,
    title,
    description,
    lat,
    lng,
  };
}

function fromNominatim(r) {
  return {
    place_id: String(r.place_id),
    title: r.name || r.display_name.split(",")[0],
    description: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  };
}

module.exports.getAutoCompleteSuggestions = async (input, near) => {
  if (!input) throw new Error("query is required");
  const q = input.trim();
  const bias =
    near && isFinite(near.lat) && isFinite(near.lng)
      ? `&lat=${Number(near.lat).toFixed(2)}&lon=${Number(near.lng).toFixed(2)}`
      : "";
  return cached(`s:${q.toLowerCase()}:${bias}`, async () => {
    try {
      const { data } = await http.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&lang=en${bias}`
      );
      const list = (data.features || []).map(fromPhoton);
      if (list.length) return list;
    } catch (err) {
      console.warn("Photon failed, falling back to Nominatim:", err.message);
    }
    const { data } = await http.get(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(q)}`
    );
    return data.map(fromNominatim);
  });
};

module.exports.getAddressCordinate = async (address) => {
  if (!address) throw new Error("Address is required");
  const list = await cached(`g:${address.toLowerCase()}`, async () => {
    const { data } = await http.get(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`
    );
    return data.map(fromNominatim);
  });
  if (!list.length) throw new Error("Unable to fetch coordinates");
  return {
    lat: list[0].lat,
    lng: list[0].lng,
    formatted_address: list[0].description,
  };
};

module.exports.reverseGeocode = async (lat, lng) => {
  return cached(
    `r:${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`,
    async () => {
      const { data } = await http.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lng}`
      );
      if (!data || data.error) throw new Error("Address not found");
      return {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        title: data.name || data.display_name.split(",")[0],
        description: data.display_name,
      };
    }
  );
};

const fmtDistance = (m) =>
  m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
const fmtDuration = (s) => {
  const mins = Math.max(1, Math.round(s / 60));
  return mins >= 60
    ? `${Math.floor(mins / 60)} h ${mins % 60} min`
    : `${mins} min`;
};

// Route between two {lat,lng} points. Returns distance (m), duration (s) and a
// [lat,lng][] polyline for drawing on the map.
module.exports.getRoute = async (from, to) => {
  if (!from || !to) throw new Error("Origin and destination are required");
  const key = (p) => `${Number(p.lng).toFixed(5)},${Number(p.lat).toFixed(5)}`;
  return cached(`route:${key(from)};${key(to)}`, async () => {
    const { data } = await http.get(
      `https://router.project-osrm.org/route/v1/driving/${key(from)};${key(to)}?overview=full&geometries=geojson`
    );
    if (data.code !== "Ok" || !data.routes?.[0]) {
      throw new Error("No route found between the specified locations");
    }
    const r = data.routes[0];
    let coords = r.geometry.coordinates;
    if (coords.length > 1500) {
      const step = Math.ceil(coords.length / 1500);
      coords = coords.filter(
        (_, i) => i % step === 0 || i === coords.length - 1
      );
    }
    return {
      distance: { value: Math.round(r.distance), text: fmtDistance(r.distance) },
      duration: { value: Math.round(r.duration), text: fmtDuration(r.duration) },
      geometry: coords.map(([lng, lat]) => [lat, lng]),
    };
  });
};

const toRad = (d) => (d * Math.PI) / 180;
module.exports.haversineKm = (a, b) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// A captain counts as online while the captain app keeps polling /api/captain/sync.
const ONLINE_WINDOW_MS = 30 * 1000;
module.exports.ONLINE_WINDOW_MS = ONLINE_WINDOW_MS;

module.exports.getAvailableCaptains = async (vehicleType) =>
  captainModel.find({
    status: "available",
    "vehicle.vehicleType": vehicleType,
    lastSeenAt: { $gte: new Date(Date.now() - ONLINE_WINDOW_MS) },
  });
