"use client";
import dynamic from "next/dynamic";

const View = dynamic(() => import("@/views/CaptainLogin"), { ssr: false });

export default function Page() {
  return <View />;
}
