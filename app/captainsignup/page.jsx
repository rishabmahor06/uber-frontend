"use client";
import dynamic from "next/dynamic";

const View = dynamic(() => import("@/views/CaptainSignup"), { ssr: false });

export default function Page() {
  return <View />;
}
