"use client";
import React from "react";
import TripLine from "./TripLine";
import { vehicleMeta } from "../lib/maps";

const LookingForDriver = ({ ride, notified, onCancel, cancelling }) => {
  const v = vehicleMeta(ride.vehicleType);
  return (
    <div>
      <div className="flex flex-col items-center py-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-lime/40" />
          <span className="absolute inset-3 animate-ping rounded-full bg-brand-lime/50 [animation-delay:300ms]" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy text-3xl">
            {v.icon}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-semibold">Looking for a captain…</h3>
        <p className="mt-1 text-center text-sm text-gray-500">
          {notified === 0
            ? "No captains are online nearby right now. You can keep waiting or cancel and try another vehicle."
            : `Request sent to ${notified ?? "nearby"} captain${
                notified === 1 ? "" : "s"
              }. Hang tight!`}
        </p>
      </div>

      <TripLine pickup={ride.pickup} destination={ride.destination} />

      <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-600">{v.name} · Pay by cash</span>
        <span className="text-lg font-bold">₹{ride.fare}</span>
      </div>

      <button
        type="button"
        onClick={onCancel}
        disabled={cancelling}
        className="mt-4 w-full rounded-xl border-2 border-red-200 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {cancelling ? "Cancelling…" : "Cancel ride"}
      </button>
    </div>
  );
};

export default LookingForDriver;
