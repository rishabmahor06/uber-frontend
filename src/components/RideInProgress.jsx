"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "../utils/axios";
import { PAY_MODES, getPaymentConfig, payRide } from "../lib/razorpay";
import TripLine from "./TripLine";
import { apiError, fmtKm, fmtMin } from "../lib/maps";

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

export const RideComplete = ({ ride, onDone, onRideUpdate, rider, captainView = false }) => {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const paid = ride.paymentStatus === "paid";
  const cash = ride.paymentMethod === "cash";

  useEffect(() => {
    let live = true;
    getPaymentConfig()
      .then((c) => live && setEnabled(!!c.enabled))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const payOnline = async (mode) => {
    setBusy(true);
    try {
      const updated = await payRide(ride, rider, mode);
      if (updated) {
        onRideUpdate?.(updated);
        toast.success("Payment successful");
      }
    } catch (err) {
      toast.error(apiError(err, "Payment failed"));
    } finally {
      setBusy(false);
    }
  };

  const payCash = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post("/payment/cash", { rideId: ride._id });
      onRideUpdate?.(data);
    } catch (err) {
      toast.error(apiError(err, "Couldn't save payment method"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime text-3xl">
        ✓
      </div>
      <h3 className="text-2xl font-semibold">{captainView ? "Ride completed" : "You've arrived!"}</h3>
      <p className="mt-1 text-gray-500">
        {captainView
          ? "Trip finished. The rider pays online or in cash"
          : paid
          ? `Paid online${ride.paymentId ? ` · ${ride.paymentId}` : ""}`
          : cash
            ? "Please pay your captain in cash"
            : "Choose how you'd like to pay"}
      </p>
      <p className="my-4 text-4xl font-extrabold">₹{ride.fare}</p>
      <TripLine
        pickup={ride.pickup}
        destination={ride.destination}
        className="text-left"
      />

      {!captainView && !paid && !cash && (
        <div className="mt-5 grid grid-cols-1 gap-2">
          {enabled && (
            <>
              <p className="text-left text-sm font-semibold text-gray-700">Pay ₹{ride.fare} with</p>
              <div className="grid grid-cols-2 gap-2">
                {PAY_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => payOnline(m)}
                    disabled={busy}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-3 text-center transition hover:border-brand-navy hover:shadow-md disabled:opacity-60"
                  >
                    <span className="flex h-10 w-full items-center justify-center">
                      {m.logo ? (
                        <img src={m.logo} alt="" className="max-h-10 w-full max-w-[110px] object-contain" />
                      ) : (
                        <span className="text-3xl">{m.icon}</span>
                      )}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{m.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">or</p>
            </>
          )}
          <button
            type="button"
            onClick={payCash}
            disabled={busy}
            className="w-full rounded-xl border border-gray-300 py-3.5 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Pay by cash
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="mt-3 w-full rounded-xl bg-brand-navy py-3.5 font-semibold text-white hover:bg-black"
      >
        Done
      </button>
    </div>
  );
};
