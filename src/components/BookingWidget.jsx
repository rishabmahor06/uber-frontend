"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router";
import LocationSearchPanel from "./LocationSearchPanel";
import MapView from "./map/MapView";
import { getRoute, reverseGeocode } from "../lib/maps";

// Landing "Request a ride": choose pickup + dropoff, then "See prices" opens /prices.
const BookingWidget = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [me, setMe] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [route, setRoute] = useState(null);

  // draw the road route on the map as soon as both places are chosen
  useEffect(() => {
    setRoute(null);
    if (!pickup || !destination) return;
    let cancelled = false;
    getRoute(pickup, destination)
      .then((r) => !cancelled && setRoute(r.geometry))
      .catch(() => !cancelled && setError("Couldn't find a road route between these places"));
    return () => {
      cancelled = true;
    };
  }, [pickup, destination]);

  const useCurrent = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const here = { lat: coords.latitude, lng: coords.longitude };
        setMe(here);
        try {
          const a = await reverseGeocode(here.lat, here.lng);
          setPickup({ title: a.title, description: a.description, ...here });
        } catch {
          setError("Couldn't find the address of your location");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("Allow location access to use your current location");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const seePrices = () => {
    try {
      sessionStorage.setItem(
        "bookingDraft",
        JSON.stringify({ pickup, destination })
      );
    } catch {}
    navigate("/prices");
  };

  const fit = route?.length
    ? route
    : [pickup, destination].filter(Boolean).map((p) => [p.lat, p.lng]);
  const fitKey = [pickup?.lat, destination?.lat, route?.length].join("|");

  return (
    <section className="mx-auto grid grid-cols-1 max-w-6xl items-start gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:gap-10 md:py-16">
    <div>
      <h2 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl">
        Request a ride
      </h2>
      <p className="mt-2 text-gray-500">
        Enter your trip to see prices — you only log in when you book.
      </p>

      <div className="mt-6">
        <LocationSearchPanel
          pickup={pickup}
          destination={destination}
          onPickup={setPickup}
          onDestination={setDestination}
          onUseCurrent={useCurrent}
          near={me || pickup}
          locating={locating}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={seePrices}
        disabled={!pickup || !destination}
        className="mt-4 w-full px-6 rounded-lg bg-black py-3 text-base font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        Book Ride
      </button>
    </div>

    <div className="h-72 overflow-hidden rounded-2xl shadow-xl sm:h-96 md:sticky md:top-24 md:h-[460px]">
      <MapView
        me={me}
        pickup={pickup}
        destination={destination}
        route={route}
        fit={fit}
        fitKey={fitKey}
        fitPadding={{ tl: [40, 40], br: [40, 40] }}
        locateClass="bottom-4"
      />
    </div>
    </section>
  );
};

export default BookingWidget;
