"use client";
import React from "react";
import TripLine from "./TripLine";
import { fmtKm, fmtMin } from "../lib/maps";

// Incoming ride request shown to the captain.
const RidePopUp = ({ ride, pickupKm, queued, onAccept, onIgnore, accepting }) => {
  const rider = [ride.user?.fullname?.firstname, ride.user?.fullname?.lastname]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold">New ride request</h3>
        {queued > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            +{queued} more
          </span>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-brand-navy p-4 text-white">
        <div className="min-w-0">
          <p className="truncate font-semibold capitalize">{rider || "Rider"}</p>
          <p className="text-sm text-white/70">
            {pickupKm != null ? `${pickupKm.toFixed(1)} km to pickup · ` : ""}
            {ride.distance ? fmtKm(ride.distance) : ""}
            {ride.duration ? ` · ${fmtMin(ride.duration)}` : ""}
          </p>
        </div>
        <p className="text-2xl font-extrabold text-brand-lime">₹{ride.fare}</p>
      </div>

      <TripLine pickup={ride.pickup} destination={ride.destination} />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onIgnore}
          disabled={accepting}
          className="rounded-xl border-2 border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Ignore
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={accepting}
          className="rounded-xl bg-brand-lime py-3 font-bold text-brand-navy hover:bg-brand-limeDark disabled:opacity-60"
        >
          {accepting ? "Accepting…" : "Accept"}
        </button>
      </div>
    </div>
  );
};

export default RidePopUp;
