"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Link, useNavigate } from "@/lib/router";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";

const logo = "/speed-logo.png";

const COPY = {
  user: {
    badge: "For riders",
    headline: "Your ride, one tap away.",
    points: [
      "Upfront prices before you book",
      "Live tracking from pickup to drop",
      "OTP-protected rides with verified captains",
    ],
    stats: [
      ["1.3M+", "Happy riders"],
      ["4.8★", "Average rating"],
      ["24/7", "Support"],
    ],
    switchText: "Are you a driver?",
    switchLabel: "Drive with Speed",
    home: "/home",
  },
  captain: {
    badge: "For captains",
    headline: "Drive on your terms. Earn more.",
    points: [
      "Accept rides near you in real time",
      "Keep what you earn — cash in hand",
      "Turn-by-turn route to every pickup",
    ],
    stats: [
      ["₹1000s", "Daily earning potential"],
      ["0", "Joining fee"],
      ["24/7", "Support"],
    ],
    switchText: "Looking for a ride?",
    switchLabel: "Switch to rider",
    home: "/captain-home",
  },
};

// Split-screen shell shared by the four auth pages.
const AuthLayout = ({ role = "user", title, subtitle, children, footer }) => {
  const c = COPY[role];
  const navigate = useNavigate();
  const { data: session, status } = useSession();

  // already signed in -> straight to the app
  useEffect(() => {
    if (status === "authenticated" && session.role === role) {
      navigate(c.home, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.role]);

  const otherLogin = role === "user" ? "/captainlogin" : "/userlogin";

  return (
    <div className="grid grid-cols-1 min-h-[100dvh] bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* brand panel */}
      <aside
        className={`relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12 ${
          role === "user"
            ? "bg-gradient-to-br from-brand-navy via-[#0f1f55] to-[#0b3d1e]"
            : "bg-gradient-to-br from-brand-forest via-[#0d4f27] to-brand-navy"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-lime/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5 blur-3xl"
        />

        <Link to="/" className="relative flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1">
            <img src={logo} alt="Speed" className="h-full w-full object-contain" />
          </span>
          <span className="font-display text-xl font-semibold">
            Speed <span className="text-brand-lime">Taxi</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-lime">
            {c.badge}
          </span>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight xl:text-5xl">
            {c.headline}
          </h2>
          <ul className="mt-8 space-y-4">
            {c.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/80">
                <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-brand-lime" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {c.stats.map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-2xl font-semibold text-brand-lime">{n}</p>
              <p className="mt-1 text-xs text-white/60">{l}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* form side */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
          >
            <FiArrowLeft /> Home
          </Link>
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img src={logo} alt="Speed" className="h-8 w-8 object-contain" />
            <span className="font-display font-semibold text-brand-navy">
              Speed <span className="text-brand-forest">Taxi</span>
            </span>
          </Link>
          <p className="hidden text-sm text-gray-500 sm:block">
            {c.switchText}{" "}
            <Link to={otherLogin} className="font-semibold text-black underline">
              {c.switchLabel}
            </Link>
          </p>
          <span className="w-12 sm:hidden" />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
            <p className="mt-8 text-center text-xs text-gray-400 sm:hidden">
              {c.switchText}{" "}
              <Link to={otherLogin} className="font-semibold text-gray-700 underline">
                {c.switchLabel}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
