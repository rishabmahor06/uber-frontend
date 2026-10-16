"use client";
import dynamic from "next/dynamic";

const View = dynamic(() => import("@/views/UserLogout"), { ssr: false });
const Wrapper = dynamic(() => import("@/views/UserProtectWrapper"), { ssr: false });

export default function Page() {
  return (
    <Wrapper>
      <View />
    </Wrapper>
  );
}
