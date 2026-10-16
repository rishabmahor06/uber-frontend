"use client";
import React from "react";
import TripLine from "./TripLine";
import { fmtKm, fmtMin } from "../lib/maps";

// Rider view while the trip is ongoing (live tracking) and after it ends.
export const RideInProgress = ({ ride, leg }) => {
  const captain = ride.captain || {};
  const name = [captain.fullname?.firstname, captain.fullname?.lastname]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <div className="mb-4 rounded-2xl bg-brand-forest p-4 text-white">
        <p className="flex items-center gap-2 text-sm text-white/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-lime" />
          Ride in progress
        </p>
        <p className="mt-1 text-2xl font-bold">
          {leg ? `${fmtMin(leg.duration.value)} to destination` : "On the way"}
        </p>
        {leg && (
          <p className="text-sm text-white/80">{fmtKm(leg.distance.value)} left</p>
        )}
      </div>
      <TripLine pickup={ride.pickup} destination={ride.destination} />
      <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-600 capitalize">
          {name ? `Captain ${name}` : "Pay by cash"}
        </span>
        <span className="text-lg font-bold">₹{ride.fare}</span>
      </div>
    </div>
  );
};

export const RideComplete = ({ ride, onDone }) => (
  <div className="text-center">
    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime text-3xl">
      ✓
    </div>
    <h3 className="text-2xl font-semibold">You've arrived!</h3>
    <p className="mt-1 text-gray-500">Please pay your captain in cash</p>
    <p className="my-4 text-4xl font-extrabold">₹{ride.fare}</p>
    <TripLine
      pickup={ride.pickup}
      destination={ride.destination}
      className="text-left"
    />
    <button
      type="button"
      onClick={onDone}
      className="mt-5 w-full rounded-xl bg-brand-navy py-3.5 font-semibold text-white hover:bg-black"
    >
      Done
    </button>
  </div>
);
