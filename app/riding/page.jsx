"use client";
import { Navigate } from "@/lib/router";

// Ride tracking now lives inside /home.
export default function Page() {
  return <Navigate to="/home" />;
}
