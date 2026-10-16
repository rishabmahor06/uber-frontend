"use client";
import React from "react";
import { FaUser } from "react-icons/fa";
import { VEHICLES, fmtKm, fmtMin } from "../lib/maps";

// Route summary + one card per vehicle type with the price for this exact route.
const VehiclePanel = ({
  quote,
  vehicleType,
  onSelect,
  onBook,
  booking,
  onEdit,
  pickup,
  destination,
}) => (
  <div>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-gray-900">Choose a ride</h3>
        <p className="mt-0.5 text-sm text-gray-500">
          {fmtKm(quote.distance.value)} · {fmtMin(quote.duration.value)}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-full border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50"
      >
        Edit
      </button>
    </div>

    <div className="mb-4 rounded-xl bg-gray-50 p-3 text-sm">
      <p className="truncate">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#3f9d0a]" />
        {pickup.description}
      </p>
      <p className="mt-1 truncate">
        <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-brand-navy" />
        {destination.description}
      </p>
    </div>

    <div className="space-y-2">
      {VEHICLES.map((v) => {
        const selected = vehicleType === v.type;
        return (
          <button
            key={v.type}
            type="button"
            onClick={() => onSelect(v.type)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
              selected
                ? "border-brand-navy bg-brand-mint"
                : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">
              {v.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold text-gray-900">
                {v.name}
                <span className="flex items-center gap-1 text-xs font-normal text-gray-500">
                  <FaUser /> {v.seats}
                </span>
              </span>
              <span className="block text-xs text-gray-500">
                {v.tag} · arrives in ~{fmtMin(quote.duration.value)}
              </span>
            </span>
            <span className="text-lg font-bold text-gray-900">
              ₹{quote.fare[v.type]}
            </span>
          </button>
        );
      })}
    </div>

    <button
      type="button"
      onClick={onBook}
      disabled={booking}
      className="mt-4 w-full rounded-xl bg-brand-navy py-3.5 text-base font-semibold text-white transition hover:bg-black disabled:opacity-60"
    >
      {booking
        ? "Booking…"
        : `Book ${VEHICLES.find((v) => v.type === vehicleType)?.name} · ₹${
            quote.fare[vehicleType]
          }`}
    </button>
  </div>
);

export default VehiclePanel;
