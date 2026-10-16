"use client";
import dynamic from "next/dynamic";

const View = dynamic(() => import("@/views/CaptainHome"), { ssr: false });
const Wrapper = dynamic(() => import("@/views/CaptainProtectWrapper"), { ssr: false });

export default function Page() {
  return (
    <Wrapper>
      <View />
    </Wrapper>
  );
}
