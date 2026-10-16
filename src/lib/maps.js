import axios from "@/utils/axios";

// Thin client for the backend's OpenStreetMap endpoints.

export const searchPlaces = async (input, near, signal) =>
  (
    await axios.get("/maps/get-suggestions", {
      params: { input, lat: near?.lat, lng: near?.lng },
      signal,
    })
  ).data;

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
