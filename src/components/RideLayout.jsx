"use client";
import React from "react";
import { IoLogOut } from "react-icons/io5";

const logo = "/speed-logo.png";

// Full-screen map with a floating header and a responsive panel:
// bottom sheet on phones, left-hand card on desktop.
const RideLayout = ({ map, children, title, subtitle, onLogout }) => (
  <div className="relative h-[100dvh] w-full overflow-hidden bg-gray-100">
    <div className="absolute inset-0">{map}</div>

    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 lg:p-5">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-2 pr-4 shadow-lg backdrop-blur">
        <img className="h-8 w-8 object-contain" src={logo} alt="Speed" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-brand-navy">{title || "Speed"}</p>
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        aria-label="Log out"
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl text-gray-700 shadow-lg backdrop-blur hover:bg-red-50 hover:text-red-500"
      >
        <IoLogOut />
      </button>
    </header>

    <section data-sheet className="absolute inset-x-0 bottom-0 z-30 flex max-h-[72dvh] flex-col rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.18)] lg:inset-x-auto lg:bottom-5 lg:left-5 lg:top-24 lg:max-h-none lg:w-[420px] lg:rounded-3xl lg:shadow-2xl">
      <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-gray-300 lg:hidden" />
      <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-6 lg:p-5">
        {children}
      </div>
    </section>
  </div>
);

export default RideLayout;
