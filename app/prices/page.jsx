"use client";
import dynamic from "next/dynamic";

const View = dynamic(() => import("@/views/Prices"), { ssr: false });

export default function Page() {
  return <View />;
}
