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

const fromNominatim = (r) => {
  const a = r.address || {};
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  return {
    place_id: `n${r.place_id}`,
    title:
      r.name ||
      street ||
      a.neighbourhood ||
      a.suburb ||
      a.city ||
      r.display_name.split(",")[0],
    description: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  };
};

// "12 MG Road", "sector 5, rohini", "flat 4b green park delhi" ... look like street addresses
const looksLikeAddress = (q) => /\d/.test(q) || q.includes(",") || q.split(/\s+/).length >= 3;

const sameSpot = (a, b) =>
  Math.abs(a.lat - b.lat) < 0.0004 && Math.abs(a.lng - b.lng) < 0.0004;

const merge = (primary, extra) => {
  const out = [...primary];
  for (const p of extra) {
    if (!out.some((o) => o.place_id === p.place_id || sameSpot(o, p))) out.push(p);
  }
  return out.slice(0, 10);
};

const suggestCache = new Map();

/**
 * Places AND street addresses. Photon answers first (fast); for address-like input
 * Nominatim is queried in parallel and merged in. `onUpdate` receives each stage so
 * the UI can show the fast results immediately.
 */
export const searchPlaces = async (input, near, signal, onUpdate) => {
  const q = input.trim();
  const hasNear = near && isFinite(near.lat) && isFinite(near.lng);
  const bias = hasNear
    ? `&lat=${Number(near.lat).toFixed(2)}&lon=${Number(near.lng).toFixed(2)}`
    : "";
  const key = `${q.toLowerCase()}|${bias}`;
  if (suggestCache.has(key)) return suggestCache.get(key);

  const photon = fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&lang=en${bias}`,
    { signal }
  )
    .then((r) => (r.ok ? r.json() : { features: [] }))
    .then((d) => (d.features || []).map(fromPhoton))
    .catch((err) => {
      if (err?.name === "AbortError") throw err;
      return [];
    });

  let nominatim = Promise.resolve([]);
  if (looksLikeAddress(q) || q.length >= 4) {
    let view = "";
    if (hasNear) {
      const { lat, lng } = near;
      view = `&viewbox=${lng - 0.7},${lat + 0.7},${lng + 0.7},${lat - 0.7}`;
    }
    // Nominatim asks for ~1 request/second, so wait until the user pauses typing
    const pause = new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 350);
      signal?.addEventListener("abort", () => {
        clearTimeout(t);
        reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
      });
    });
    nominatim = pause.then(() => fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(q)}${view}`,
      { signal }
    ))
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => d.map(fromNominatim))
      .catch((err) => {
        if (err?.name === "AbortError") throw err;
        return [];
      });
  }

  const first = await photon;
  if (first.length) onUpdate?.(first);
  const extra = await nominatim;
  let list = merge(first, extra);
  // exact-looking addresses are best matches from Nominatim: show them first
  if (looksLikeAddress(q) && extra.length) list = merge(extra.slice(0, 3), first);

  if (!list.length) {
    // fallback through our own API
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
