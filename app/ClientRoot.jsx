"use client";
import dynamic from "next/dynamic";

// Providers read localStorage/window, so they only render in the browser.
const Providers = dynamic(() => import("@/Providers"), { ssr: false });

export default function ClientRoot({ children }) {
  return <Providers>{children}</Providers>;
}
