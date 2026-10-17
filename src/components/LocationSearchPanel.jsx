"use client";
import React, { useEffect, useRef, useState } from "react";
import { IoLocationSharp, IoSearch } from "react-icons/io5";
import { MdMyLocation } from "react-icons/md";
import { searchPlaces } from "../lib/maps";

// Pickup + destination inputs with live OpenStreetMap suggestions.
// `pickup` / `destination` are selected places ({title, description, lat, lng}) or null.
const LocationSearchPanel = ({
  pickup,
  destination,
  onPickup,
  onDestination,
  onUseCurrent,
  near,
  locating,
}) => {
  const [texts, setTexts] = useState({ pickup: "", destination: "" });
  const [active, setActive] = useState("pickup");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const destRef = useRef(null);
  const reqId = useRef(0);

  // mirror externally selected places (e.g. current location) into the inputs
  useEffect(() => {
    setTexts((t) => ({ ...t, pickup: pickup ? pickup.description : t.pickup }));
  }, [pickup]);
  useEffect(() => {
    setTexts((t) => ({
      ...t,
      destination: destination ? destination.description : t.destination,
    }));
  }, [destination]);

  const query = texts[active];
  const selected = active === "pickup" ? pickup : destination;

  useEffect(() => {
    if (selected || !query || query.trim().length < 1) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await searchPlaces(query.trim(), near, ctrl.signal, (partial) => {
          if (id === reqId.current) setResults(partial);
        });
        if (id !== reqId.current) return;
        setResults(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
        if (id !== reqId.current) return;
        setResults([]);
        setError("Couldn't load suggestions. Check your connection.");
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 120);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, active, selected, near?.lat, near?.lng]);

  const type = (field, value) => {
    setTexts((t) => ({ ...t, [field]: value }));
    if (field === "pickup" && pickup) onPickup(null);
    if (field === "destination" && destination) onDestination(null);
  };

  const choose = (place) => {
    if (active === "pickup") {
      onPickup(place);
      destRef.current?.focus();
      setActive("destination");
    } else {
      onDestination(place);
    }
    setResults([]);
  };

  const field = (name, placeholder, dot) => (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 px-3 bg-gray-100 transition-colors ${
        active === name ? "border-black bg-white" : "border-transparent"
      }`}
    >
      <span className={`h-3 w-3 shrink-0 ${dot}`} />
      <input
        ref={name === "destination" ? destRef : null}
        value={texts[name]}
        onFocus={() => setActive(name)}
        onChange={(e) => type(name, e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-transparent py-3 text-base outline-none placeholder:text-gray-400"
      />
      {name === "pickup" && (
        <button
          type="button"
          onClick={onUseCurrent}
          disabled={locating}
          title="Use my current location"
          aria-label="Use my current location"
          className="shrink-0 rounded-full p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          <MdMyLocation className={`text-xl ${locating ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="relative space-y-2">
        {/* line joining the pickup and drop-off markers */}
        <span className="pointer-events-none absolute left-[19px] top-[32px] z-10 h-[48px] w-0.5 bg-gray-800" />
        {field("pickup", "Pickup location", "rounded-full border-[3px] border-black bg-white")}
        {field("destination", "Dropoff location", "rounded-[2px] bg-black")}
      </div>

      <div className="mt-3">
        {loading && (
          <p className="flex items-center gap-2 p-3 text-sm text-gray-500">
            <IoSearch className="animate-pulse" /> Searching places…
          </p>
        )}
        {error && <p className="p-3 text-sm text-red-500">{error}</p>}
        {!loading &&
          !error &&
          !selected &&
          query?.trim().length >= 1 &&
          results.length === 0 && (
            <p className="p-3 text-sm text-gray-500">No places found</p>
          )}
        {!selected && query?.trim().length < 1 && (
          <p className="p-3 text-sm text-gray-400">
            Start typing a place, area or landmark.
          </p>
        )}
        <ul className="divide-y divide-gray-100">
          {results.map((place) => (
            <li key={place.place_id}>
              <button
                type="button"
                onClick={() => choose(place)}
                className="flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left hover:bg-gray-50 active:bg-gray-100"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <IoLocationSharp className="text-lg text-gray-700" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-900">
                    {place.title}
                  </span>
                  <span className="block text-sm text-gray-500 line-clamp-2">
                    {place.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LocationSearchPanel;
