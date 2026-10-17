"use client";
import { useCallback, useEffect, useState } from "react";

const toPosition = (p) => ({
  lat: p.coords.latitude,
  lng: p.coords.longitude,
  accuracy: p.coords.accuracy,
});

export const geoErrorMessage = (e) => {
  if (!e) return "Unable to get your location";
  if (e.code === 1)
    return "Location access is blocked. Click the lock icon in the address bar, allow Location, then try again.";
  if (e.code === 2) return "Your device couldn't determine its location. Turn on GPS / Wi-Fi and try again.";
  if (e.code === 3) return "Getting your location took too long. Please try again.";
  return e.message || "Unable to get your location";
};

const getOnce = (options) =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return reject({ message: "Location is not supported by this browser" });
    }
    navigator.geolocation.getCurrentPosition((p) => resolve(toPosition(p)), reject, options);
  });

// Live device position -> { position: {lat,lng,accuracy} | null, error, request() }
export default function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser");
      return;
    }
    let live = true;

    // quick coarse fix first (Wi-Fi / network), so the app isn't waiting for a GPS lock
    getOnce({ enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 })
      .then((p) => {
        if (!live) return;
        setError(null);
        setPosition((old) => old || p);
      })
      .catch((e) => live && setError(geoErrorMessage(e)));

    const id = navigator.geolocation.watchPosition(
      (p) => {
        setError(null);
        setPosition(toPosition(p));
      },
      (e) => {
        // a timeout just means "no fresh fix yet"; the watch keeps running
        if (e.code !== 3) setError(geoErrorMessage(e));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    return () => {
      live = false;
      navigator.geolocation.clearWatch(id);
    };
  }, []);

  // explicit request (e.g. from a button): triggers the permission prompt if needed
  const request = useCallback(async () => {
    try {
      const p = await getOnce({ enableHighAccuracy: false, maximumAge: 30000, timeout: 12000 });
      setError(null);
      setPosition(p);
      return p;
    } catch (e) {
      const msg = geoErrorMessage(e);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return { position, error, request };
}
