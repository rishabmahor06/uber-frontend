"use client";
import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import TripLine from "./TripLine";
import { vehicleMeta, fmtKm, fmtMin } from "../lib/maps";

// Captain accepted: show who is coming, the OTP and live ETA.
const WaitingForDriver = ({ ride, leg, onCancel, cancelling }) => {
  const captain = ride.captain || {};
  const name =
    [captain.fullname?.firstname, captain.fullname?.lastname]
      .filter(Boolean)
      .join(" ") || "Your captain";
  const vehicle = captain.vehicle || {};
  const v = vehicleMeta(vehicle.vehicleType || ride.vehicleType);

  return (
    <div>
      <div className="mb-4 rounded-2xl bg-brand-navy p-4 text-white">
        <p className="text-sm text-white/70">
          {leg
            ? `Arriving in ${fmtMin(leg.duration.value)} · ${fmtKm(
                leg.distance.value
              )} away`
            : "Your captain is on the way"}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold capitalize">{name}</p>
            <p className="text-sm text-white/80">
              {v.name}
              {vehicle.color ? ` · ${vehicle.color}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="rounded-lg bg-white px-3 py-1 text-base font-bold uppercase tracking-wider text-brand-navy">
              {vehicle.plate || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-dashed border-brand-lime px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Share OTP with captain
          </p>
          <p className="font-mono text-3xl font-bold tracking-[0.3em]">{ride.otp}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-mint text-brand-forest">
          <FaPhoneAlt />
        </span>
      </div>

      <TripLine pickup={ride.pickup} destination={ride.destination} />

      <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-600">Pay by cash</span>
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

export default WaitingForDriver;
