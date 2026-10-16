"use client";
import React, { useState } from "react";
import TripLine from "./TripLine";
import { fmtKm, fmtMin } from "../lib/maps";

// Captain is heading to the rider: enter the rider's OTP to start the trip.
const ConfirmRidePopUp = ({ ride, leg, onStart, starting }) => {
  const [otp, setOtp] = useState("");
  const rider = [ride.user?.fullname?.firstname, ride.user?.fullname?.lastname]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onStart(otp);
      }}
    >
      <div className="mb-4 rounded-2xl bg-brand-navy p-4 text-white">
        <p className="text-sm text-white/70">
          {leg
            ? `Pickup in ${fmtMin(leg.duration.value)} · ${fmtKm(leg.distance.value)}`
            : "Head to the pickup point"}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-semibold capitalize">{rider || "Rider"}</p>
          <p className="text-xl font-extrabold text-brand-lime">₹{ride.fare}</p>
        </div>
      </div>

      <TripLine pickup={ride.pickup} destination={ride.destination} />

      <label className="mt-5 block text-sm font-medium text-gray-700">
        Enter OTP from the rider
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-brand-navy"
        />
      </label>

      <button
        type="submit"
        disabled={otp.length !== 6 || starting}
        className="mt-4 w-full rounded-xl bg-brand-lime py-3.5 font-bold text-brand-navy hover:bg-brand-limeDark disabled:opacity-50"
      >
        {starting ? "Starting…" : "Start ride"}
      </button>
    </form>
  );
};

export default ConfirmRidePopUp;
