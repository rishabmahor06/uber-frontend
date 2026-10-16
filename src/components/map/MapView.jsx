"use client";
import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdMyLocation } from "react-icons/md";

const mk = (html, size = [28, 28], anchor = [14, 14]) =>
  L.divIcon({
    className: "speed-marker",
    html,
    iconSize: size,
    iconAnchor: anchor,
  });

const icons = {
  pickup: mk('<div class="mk-pin mk-green"></div>'),
  destination: mk('<div class="mk-pin mk-black"></div>'),
  me: mk('<div class="mk-me"><span></span></div>'),
  driver: mk('<div class="mk-driver">🚖</div>', [40, 40], [20, 20]),
};

const ll = (p) => [p.lat, p.lng];

// height of the bottom sheet (phones) so the route is framed in the visible map
const sheetHeight = () =>
  document.querySelector("[data-sheet]")?.offsetHeight ??
  Math.round(window.innerHeight * 0.5);

// Re-fits the map whenever `fitKey` changes (e.g. step or route changed).
function Fit({ points, fitKey, padding }) {
  const map = useMap();
  const latest = useRef(points);
  latest.current = points;

  useEffect(() => {
    const pts = latest.current;
    if (!pts.length) return;
    const wide = window.innerWidth >= 1024;
    const opts = padding
      ? { paddingTopLeft: padding.tl, paddingBottomRight: padding.br }
      : wide
      ? { paddingTopLeft: [470, 90], paddingBottomRight: [40, 40] }
      : {
          paddingTopLeft: [30, 80],
          paddingBottomRight: [30, sheetHeight() + 20],
        };
    if (pts.length === 1) {
      map.flyTo(pts[0], 16, { duration: 0.8 });
    } else {
      map.fitBounds(L.latLngBounds(pts), { ...opts, maxZoom: 16 });
    }
  }, [fitKey, map]);
  return null;
}

// Centers on the user's GPS fix the first time it arrives (when nothing else to show).
function CenterOnce({ me, enabled }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (enabled && me && !done.current) {
      done.current = true;
      map.flyTo(ll(me), 15, { duration: 0.8 });
    }
  }, [me, enabled, map]);
  return null;
}

// keeps tiles filling the container when the layout/viewport changes
function KeepSized() {
  const map = useMap();
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map]);
  return null;
}

function LocateButton({ me, className }) {
  const map = useMap();
  if (!me) return null;
  return (
    <button
      type="button"
      onClick={() => map.flyTo(ll(me), 16, { duration: 0.6 })}
      aria-label="Go to my location"
      className={`absolute right-3 z-[1000] ${
        className || "top-24 lg:top-auto lg:bottom-6"
      } h-11 w-11 rounded-full bg-white shadow-lg flex items-center justify-center text-brand-navy hover:bg-gray-50`}
    >
      <MdMyLocation className="text-xl" />
    </button>
  );
}

/**
 * props:
 *  me          {lat,lng}   device position (blue dot)
 *  pickup      {lat,lng}
 *  destination {lat,lng}
 *  route       [lat,lng][] main route polyline
 *  approach    [lat,lng][] secondary dashed polyline (driver -> pickup)
 *  driver      {lat,lng}   moving captain marker
 *  fit         [lat,lng][] points to frame; refit when fitKey changes
 */
const MapView = ({
  me,
  pickup,
  destination,
  route,
  approach,
  driver,
  fit = [],
  fitKey = "",
  fitPadding, // {tl:[x,y], br:[x,y]} for embedded maps; default is tuned for the ride sheet
  locateClass,
}) => {
  return (
    <div className="relative h-full w-full isolate">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        zoomControl={false}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {route?.length > 1 && (
          <>
            <Polyline
              positions={route}
              pathOptions={{ color: "#ffffff", weight: 10, opacity: 0.95 }}
            />
            <Polyline
              positions={route}
              pathOptions={{ color: "#0b1437", weight: 5, opacity: 1 }}
            />
          </>
        )}
        {approach?.length > 1 && (
          <Polyline
            positions={approach}
            pathOptions={{
              color: "#3f9d0a",
              weight: 5,
              dashArray: "2 10",
              lineCap: "round",
            }}
          />
        )}

        {pickup && <Marker position={ll(pickup)} icon={icons.pickup} />}
        {destination && (
          <Marker position={ll(destination)} icon={icons.destination} />
        )}
        {me && <Marker position={ll(me)} icon={icons.me} zIndexOffset={500} />}
        {driver && (
          <Marker position={ll(driver)} icon={icons.driver} zIndexOffset={1000} />
        )}

        <Fit points={fit} fitKey={fitKey} padding={fitPadding} />
        <CenterOnce me={me} enabled={!fit.length} />
        <KeepSized />
        <LocateButton me={me} className={locateClass} />
      </MapContainer>
    </div>
  );
};

export default MapView;
