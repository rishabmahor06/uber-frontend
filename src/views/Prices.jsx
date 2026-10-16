"use client";
import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Link, useNavigate } from "@/lib/router";
import { FiArrowLeft } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import {
  VEHICLES,
  apiError,
  fmtKm,
  fmtMin,
  getFareQuote,
} from "../lib/maps";

const logo = "/speed-logo.png";

// Page 2 of booking: trip summary + "Select service" with prices, then log in and continue.
const Prices = () => {
  const navigate = useNavigate();
  const { data: session, status } = useSession();
  const isUser = status === "authenticated" && session.role === "user";
  const isCaptain = status === "authenticated" && session.role === "captain";

  const [draft, setDraft] = useState(null);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // trip chosen on the landing page
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem("bookingDraft") || "null");
      if (d?.pickup && d?.destination) {
        setDraft(d);
        return;
      }
    } catch {}
    navigate("/", { replace: true });
    // read once on mount (navigate changes identity every render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draft) return;
    let cancelled = false;
    getFareQuote(draft.pickup, draft.destination)
      .then((q) => !cancelled && setQuote(q))
      .catch((e) => !cancelled && setError(apiError(e, "Couldn't find a route between these places")));
    return () => {
      cancelled = true;
    };
  }, [draft]);

  const saveAndGo = () => {
    try {
      sessionStorage.setItem(
        "bookingDraft",
        JSON.stringify({ ...draft, vehicleType: vehicle })
      );
    } catch {}
    navigate("/home");
  };

  const proceed = () => {
    if (!vehicle) return;
    if (isUser) saveAndGo();
    else setLoginOpen(true);
  };

  const login = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    const res = await signIn("user-credentials", {
      email: creds.email.trim(),
      password: creds.password,
      redirect: false,
    });
    setLoggingIn(false);
    if (res?.ok) saveAndGo();
    else setLoginError(res?.error || "Invalid email or password");
  };

  const chosen = VEHICLES.find((v) => v.type === vehicle);
  const field =
    "w-full rounded-lg bg-gray-100 px-3 py-3 text-base text-gray-900 outline-none placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-black";

  return (
    <div className="min-h-[100dvh] bg-white text-brand-navy">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <img src={logo} alt="Speed" className="h-8 w-8 object-contain" />
          <span className="font-extrabold">
            Speed <span className="text-brand-forest">Taxi</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-44 pt-5">
        {/* trip card */}
        {draft && (
          <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <span className="absolute left-[21px] top-[34px] h-[34px] w-px border-l-2 border-dotted border-gray-400" />
            <div className="flex items-start gap-3">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#3f9d0a]" />
              <p className="text-sm font-medium">{draft.pickup.description}</p>
            </div>
            <div className="my-3 ml-6 border-t border-gray-200" />
            <div className="flex items-start gap-3">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-[3px] border-red-500" />
              <p className="text-sm font-medium">{draft.destination.description}</p>
            </div>
            <Link
              to="/"
              className="absolute right-4 top-4 text-sm font-semibold underline"
            >
              Edit
            </Link>
          </div>
        )}

        <h2 className="mb-1 mt-6 text-xl font-semibold">Select service</h2>
        {quote && (
          <p className="mb-3 text-sm text-gray-500">
            {fmtKm(quote.distance.value)} · about {fmtMin(quote.duration.value)}
          </p>
        )}

        {!quote && !error && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}{" "}
            <Link to="/" className="font-semibold underline">
              Change trip
            </Link>
          </p>
        )}

        {quote && (
          <ul className="space-y-2">
            {VEHICLES.map((v) => {
              const active = vehicle === v.type;
              return (
                <li key={v.type}>
                  <button
                    type="button"
                    onClick={() => setVehicle(v.type)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition ${
                      active
                        ? "border-brand-navy bg-gray-50"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center text-3xl">
                      {v.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-lg ${active ? "font-bold" : ""}`}>
                        {v.name}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {v.tag} · {v.seats} seat{v.seats > 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className={`text-lg ${active ? "font-extrabold" : "font-semibold"}`}>
                      ₹{quote.fare[v.type]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <IoCashOutline className="text-lg" /> Cash
          </p>
          <button
            type="button"
            onClick={proceed}
            disabled={!quote || !vehicle}
            className="w-full rounded-lg bg-brand-lime py-3.5 text-base font-extrabold text-brand-navy transition hover:bg-brand-limeDark disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
          >
            {vehicle
              ? `Continue Booking · ${chosen.name} ₹${quote.fare[vehicle]}`
              : "Select a service to continue"}
          </button>
        </div>
      </div>

      {/* login */}
      {loginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setLoginOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {isCaptain ? (
              <>
                <h3 className="text-xl font-semibold">Rider account needed</h3>
                <p className="mt-2 text-sm text-gray-600">
                  You're logged in as a captain. Log out and sign in with a rider
                  account to book this ride.
                </p>
              </>
            ) : (
              <form onSubmit={login} className="space-y-3">
                <h3 className="text-xl font-semibold">Log in to continue</h3>
                <p className="text-sm text-gray-500">
                  {chosen?.name} · ₹{quote?.fare[vehicle]} · {draft?.destination.title}
                </p>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="Email address"
                  value={creds.email}
                  onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                  className={field}
                />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  value={creds.password}
                  onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                  className={field}
                />
                {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full rounded-lg bg-black py-3 text-base font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {loggingIn ? "Logging in…" : "Log in & book"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  New to Speed?{" "}
                  <Link
                    to="/usersignup"
                    onClick={() => {
                      try {
                        sessionStorage.setItem(
                          "bookingDraft",
                          JSON.stringify({ ...draft, vehicleType: vehicle })
                        );
                      } catch {}
                    }}
                    className="font-semibold text-black underline"
                  >
                    Create an account
                  </Link>
                </p>
              </form>
            )}
            <button
              type="button"
              onClick={() => setLoginOpen(false)}
              className="mt-4 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prices;
