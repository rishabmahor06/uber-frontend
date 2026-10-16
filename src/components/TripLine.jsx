"use client";
import React from "react";

// Pickup -> destination summary used by every ride panel.
const TripLine = ({ pickup, destination, className = "" }) => (
  <div className={`relative space-y-4 ${className}`}>
    <span className="absolute left-[5px] top-3 bottom-3 w-0.5 bg-gray-300" />
    <div className="relative flex items-start gap-3">
      <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-[#3f9d0a] ring-4 ring-white" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-gray-400">Pickup</p>
        <p className="text-sm font-medium text-gray-900 line-clamp-2">{pickup}</p>
      </div>
    </div>
    <div className="relative flex items-start gap-3">
      <span className="mt-1.5 h-3 w-3 shrink-0 rounded-sm bg-brand-navy ring-4 ring-white" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-gray-400">Drop-off</p>
        <p className="text-sm font-medium text-gray-900 line-clamp-2">
          {destination}
        </p>
      </div>
    </div>
  </div>
);

export default TripLine;
