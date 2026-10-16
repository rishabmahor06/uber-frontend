"use client";
import React from "react";
import TripLine from "./TripLine";
import { fmtKm, fmtMin } from "../lib/maps";

// Captain view while the trip is ongoing.
const FinishRide = ({ ride, leg, onFinish, finishing }) => {
  const rider = [ride.user?.fullname?.firstname, ride.user?.fullname?.lastname]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <div className="mb-4 rounded-2xl bg-brand-forest p-4 text-white">
        <p className="flex items-center gap-2 text-sm text-white/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-lime" />
          Trip in progress
        </p>
        <p className="mt-1 text-2xl font-bold">
          {leg ? `${fmtMin(leg.duration.value)} to drop-off` : "Drive to the destination"}
        </p>
        {leg && <p className="text-sm text-white/80">{fmtKm(leg.distance.value)} left</p>}
      </div>

      <TripLine pickup={ride.pickup} destination={ride.destination} />

      <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-sm capitalize text-gray-600">
          Collect cash from {rider || "rider"}
        </span>
        <span className="text-lg font-bold">₹{ride.fare}</span>
      </div>

      <button
        type="button"
        onClick={onFinish}
        disabled={finishing}
        className="mt-4 w-full rounded-xl bg-brand-navy py-3.5 font-semibold text-white hover:bg-black disabled:opacity-60"
      >
        {finishing ? "Finishing…" : "Finish ride"}
      </button>
    </div>
  );
};

export default FinishRide;
