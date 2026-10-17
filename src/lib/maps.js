import axios from "@/utils/axios";

// Thin client for the backend's OpenStreetMap endpoints.

// ---- place suggestions: browser -> Photon directly (fast, CORS-enabled), API route as fallback ----
const uniq = (parts) => parts.filter(Boolean).filter((p, i, a) => a.indexOf(p) === i);

const fromPhoton = (f) => {
  const p = f.properties || {};
  const [lng, lat] = f.geometry.coordinates;
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  return {
    place_id: `${p.osm_type}${p.osm_id}`,
    title: p.name || street || p.city || p.state || "",
    description: uniq([
      p.name,
      street,
      p.district || p.locality,
      p.city || p.county,
      p.state,
      p.postcode,
      p.country,
    ]).join(", "),
    lat,
    lng,
  };
};

const suggestCache = new Map();

export const searchPlaces = async (input, near, signal) => {
  const q = input.trim();
  const bias =
    near && isFinite(near.lat) && isFinite(near.lng)
      ? `&lat=${Number(near.lat).toFixed(2)}&lon=${Number(near.lng).toFixed(2)}`
      : "";
  const key = `${q.toLowerCase()}|${bias}`;
  if (suggestCache.has(key)) return suggestCache.get(key);

  let list = null;
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&lang=en${bias}`,
      { signal }
    );
    if (res.ok) list = ((await res.json()).features || []).map(fromPhoton);
  } catch (err) {
    if (err?.name === "AbortError") throw err;
  }
  if (!list?.length) {
    // fallback through our own API (Nominatim backup)
    list = (
      await axios.get("/maps/get-suggestions", {
        params: { input: q, lat: near?.lat, lng: near?.lng },
        signal,
      })
    ).data;
  }
  suggestCache.set(key, list);
  if (suggestCache.size > 200) suggestCache.delete(suggestCache.keys().next().value);
  return list;
};

export const reverseGeocode = async (lat, lng) =>
  (await axios.get("/maps/reverse", { params: { lat, lng } })).data;

export const getRoute = async (from, to) =>
  (
    await axios.get("/maps/route", {
      params: {
        fromLat: from.lat,
        fromLng: from.lng,
        toLat: to.lat,
        toLng: to.lng,
      },
    })
  ).data;

// { fare: {car, auto, motorcycle}, distance, duration, geometry }
export const getFareQuote = async (pickup, destination) =>
  (
    await axios.get("/ride/estimate", {
      params: {
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destLat: destination.lat,
        destLng: destination.lng,
      },
    })
  ).data;

export const apiError = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.msg ||
  err?.response?.data?.error?.[0]?.msg ||
  err?.message ||
  fallback;

export const haversineKm = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

export const fmtKm = (meters) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

export const fmtMin = (seconds) => {
  const mins = Math.max(1, Math.round(seconds / 60));
  return mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
};

export const VEHICLES = [
  { type: "motorcycle", name: "Bike", icon: "🏍️", seats: 1, tag: "Quick bike rides" },
  { type: "auto", name: "Auto", icon: "🛺", seats: 3, tag: "Affordable auto rides" },
  { type: "car", name: "Car", icon: "🚗", seats: 4, tag: "Comfortable AC cabs" },
];

export const vehicleMeta = (type) =>
  VEHICLES.find((v) => v.type === type) || VEHICLES[2];
