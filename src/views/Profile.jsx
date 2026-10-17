"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { IoArrowBack, IoClose, IoCopyOutline, IoLogOut } from "react-icons/io5";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useNavigate } from "@/lib/router";
import axios from "../utils/axios";
import { UserDataContext } from "../context/UserContext";
import { CaptainDataContext } from "../context/CaptainContext";
import TripLine from "../components/TripLine";
import { apiError, fmtKm, fmtMin, vehicleMeta } from "../lib/maps";

const fullName = (p) =>
  [p?.fullname?.firstname, p?.fullname?.lastname].filter(Boolean).join(" ") || "—";

const when = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// how the ride was settled
const payState = (r) => {
  if (r.status === "cancelled") return { label: "Cancelled", tone: "bg-gray-100 text-gray-600" };
  if (r.paymentStatus === "paid") return { label: "Paid online", tone: "bg-emerald-100 text-emerald-800" };
  if (r.paymentMethod === "cash") return { label: "Cash", tone: "bg-amber-100 text-amber-800" };
  return { label: "Payment pending", tone: "bg-red-100 text-red-700" };
};

const Pill = ({ tone, children }) => (
  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{children}</span>
);

const Row = ({ label, value, mono, copy }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <dt className="shrink-0 text-sm text-gray-500">{label}</dt>
    <dd
      className={`min-w-0 text-right text-sm font-medium text-gray-900 ${
        mono ? "break-all font-mono text-xs" : ""
      }`}
    >
      {value || "—"}
      {copy && value && (
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={() => {
            navigator.clipboard?.writeText(value);
            toast.success("Copied");
          }}
          className="ml-2 inline-flex align-middle text-gray-400 hover:text-gray-800"
        >
          <IoCopyOutline />
        </button>
      )}
    </dd>
  </div>
);

// Ride + payment details of one trip
const RideDetail = ({ ride, role, me, onClose }) => {
  const rider = role === "user" ? me : ride.user;
  const captain = role === "captain" ? me : ride.captain;
  const state = payState(ride);
  const vehicle = captain?.vehicle;
  const paid = ride.paymentStatus === "paid";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-navy">Ride details</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-xl text-gray-500 hover:bg-gray-100"
          >
            <IoClose />
          </button>
        </div>

        <div className="rounded-2xl bg-brand-navy p-4 text-white">
          <p className="text-sm text-white/70">{ride.status === "cancelled" ? "Cancelled ride" : "Fare"}</p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-3xl font-extrabold">{money(ride.fare)}</p>
            <Pill tone={state.tone}>{state.label}</Pill>
          </div>
        </div>

        <TripLine pickup={ride.pickup} destination={ride.destination} className="mt-4" />

        <h4 className="mb-1 mt-5 text-sm font-bold uppercase tracking-wide text-gray-400">Payment</h4>
        <dl className="divide-y divide-gray-100">
          <Row label="Paid by" value={fullName(rider)} />
          <Row label="Received by" value={fullName(captain)} />
          <Row
            label="Method"
            value={paid ? "Online (Razorpay)" : ride.paymentMethod === "cash" ? "Cash" : "Not paid yet"}
          />
          <Row label="Paid on" value={paid ? when(ride.paidAt || ride.updatedAt) : ""} />
          <Row label="Razorpay transaction ID" value={ride.paymentId} mono copy />
          <Row label="Razorpay order ID" value={ride.orderId} mono copy />
        </dl>

        <h4 className="mb-1 mt-5 text-sm font-bold uppercase tracking-wide text-gray-400">Ride</h4>
        <dl className="divide-y divide-gray-100">
          <Row label="Booked at" value={when(ride.createdAt)} />
          <Row
            label="Completed at"
            value={ride.status === "completed" ? when(ride.completedAt || ride.updatedAt) : ""}
          />
          <Row label="Status" value={ride.status} />
          <Row label="Distance" value={ride.distance ? fmtKm(ride.distance) : ""} />
          <Row label="Duration" value={ride.duration ? fmtMin(ride.duration) : ""} />
          <Row
            label="Vehicle"
            value={
              vehicle
                ? `${vehicleMeta(ride.vehicleType).name} · ${vehicle.plate}`
                : vehicleMeta(ride.vehicleType).name
            }
          />
          <Row label="Ride ID" value={ride._id} mono copy />
        </dl>
      </div>
    </div>
  );
};

const RideCard = ({ ride, role, onOpen, show }) => {
  const other = role === "user" ? ride.captain : ride.user;
  const state = payState(ride);
  const stamp = show === "payments" && ride.paidAt ? ride.paidAt : ride.completedAt || ride.createdAt;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(ride)}
        className="flex w-full flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-navy hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-brand-navy">{money(ride.fare)}</span>
          <Pill tone={state.tone}>{state.label}</Pill>
        </div>
        <p className="text-xs text-gray-500">{when(stamp)}</p>
        {show === "payments" ? (
          <p className="text-sm text-gray-700">
            {role === "user" ? "Paid to " : "Received from "}
            <span className="font-semibold">{fullName(other)}</span>
          </p>
        ) : (
          <p className="truncate text-sm text-gray-700">
            {ride.pickup} <span className="text-gray-400">→</span> {ride.destination}
          </p>
        )}
        {ride.paymentId && show === "payments" && (
          <p className="truncate font-mono text-xs text-gray-400">{ride.paymentId}</p>
        )}
      </button>
    </li>
  );
};

const Profile = ({ role }) => {
  const navigate = useNavigate();
  const userCtx = useContext(UserDataContext);
  const captainCtx = useContext(CaptainDataContext);
  const me = role === "user" ? userCtx.user : captainCtx.captain;
  const homePath = role === "user" ? "/home" : "/captain-home";

  const [rides, setRides] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("payments");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let live = true;
    axios
      .get(role === "user" ? "/ride/history" : "/ride/history-captain")
      .then((r) => live && setRides(r.data.rides || []))
      .catch((e) => live && setError(apiError(e, "Couldn't load history")));
    return () => {
      live = false;
    };
  }, [role]);

  const completed = useMemo(() => (rides || []).filter((r) => r.status === "completed"), [rides]);
  const payments = useMemo(
    () => completed.filter((r) => r.paymentStatus === "paid" || r.paymentMethod),
    [completed]
  );
  const total = completed.reduce((sum, r) => sum + (r.fare || 0), 0);
  const online = completed
    .filter((r) => r.paymentStatus === "paid")
    .reduce((s, r) => s + r.fare, 0);

  const list = tab === "payments" ? payments : rides || [];
  const initial = (me?.fullname?.firstname || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(homePath)}
            className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-brand-navy hover:bg-gray-100"
          >
            <IoArrowBack className="text-lg" /> Back
          </button>
          <h1 className="text-base font-bold text-brand-navy">My profile</h1>
          <button
            type="button"
            aria-label="Log out"
            onClick={() =>
              signOut({ callbackUrl: role === "user" ? "/userlogin" : "/captainlogin" })
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-gray-600 hover:bg-red-50 hover:text-red-500"
          >
            <IoLogOut />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        <section className="flex items-center gap-4 rounded-3xl bg-brand-navy p-5 text-white">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-lime text-2xl font-extrabold text-brand-navy">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">{fullName(me)}</p>
            <p className="truncate text-sm text-white/70">{me?.email}</p>
            {role === "captain" && me?.vehicle && (
              <p className="mt-1 text-xs capitalize text-white/80">
                {vehicleMeta(me.vehicle.vehicleType).name} · {me.vehicle.color} · {me.vehicle.plate}
              </p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            [role === "user" ? "Total spent" : "Total earned", money(total)],
            ["Rides", completed.length],
            ["Paid online", money(online)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 truncate text-base font-extrabold text-brand-navy sm:text-xl">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-gray-200 p-1">
          {[
            ["payments", "Payment history"],
            ["rides", "Ride history"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                tab === id ? "bg-white text-brand-navy shadow" : "text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
        {!error && rides === null && (
          <div className="flex justify-center py-10">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-brand-navy" />
          </div>
        )}
        {rides && list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            {tab === "payments" ? "No payments yet." : "No rides yet."}
          </p>
        )}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((r) => (
            <RideCard key={r._id} ride={r} role={role} show={tab} onOpen={setOpen} />
          ))}
        </ul>
      </main>

      {open && <RideDetail ride={open} role={role} me={me} onClose={() => setOpen(null)} />}
    </div>
  );
};

export default Profile;
