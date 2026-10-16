"use client";
import { Navigate } from "@/lib/router";

// Ride tracking now lives inside /captain-home.
export default function Page() {
  return <Navigate to="/captain-home" />;
}
