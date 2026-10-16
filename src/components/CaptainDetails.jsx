"use client";
import React from "react";
import { vehicleMeta } from "../lib/maps";

// Idle captain card: who is online and how they're doing.
const CaptainDetails = ({ captain, locationError, hasLocation }) => {
  const name =
    [captain?.fullname?.firstname, captain?.fullname?.lastname]
      .filter(Boolean)
      .join(" ") || "Captain";
  const vehicle = captain?.vehicle || {};
  const v = vehicleMeta(vehicle.vehicleType);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy text-2xl text-white">
          {name[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold capitalize">{name}</h3>
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            Online · waiting for ride requests
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-2xl">{v.icon}</p>
          <p className="mt-1 text-xs text-gray-500">{v.name}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="truncate text-sm font-bold uppercase">
            {vehicle.plate || "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Plate</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="truncate text-sm font-bold capitalize">
            {vehicle.color || "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Colour</p>
        </div>
      </div>

      <p
        className={`mt-4 rounded-xl p-3 text-sm ${
          hasLocation ? "bg-brand-mint text-brand-forest" : "bg-amber-50 text-amber-700"
        }`}
      >
        {hasLocation
          ? "Your live location is being shared so nearby riders can find you."
          : locationError || "Getting your location… please allow location access."}
      </p>
    </div>
  );
};

export default CaptainDetails;
