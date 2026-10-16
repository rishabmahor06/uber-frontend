"use client";
import { Navigate } from "@/lib/router";

export default function NotFound() {
  return <Navigate to="/" />;
}
