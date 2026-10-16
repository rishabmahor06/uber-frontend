"use client";
import { useContext, useEffect } from "react";
import { useSession } from "next-auth/react";
import { setAuth } from "./lib/authToken";
import { UserDataContext } from "./context/UserContext";
import { CaptainDataContext } from "./context/CaptainContext";

// Mirrors the NextAuth session into the token helper and the user/captain contexts.
export default function AuthSync({ children }) {
  const { data: session, status } = useSession();
  const { setUser } = useContext(UserDataContext);
  const { updateCaptain } = useContext(CaptainDataContext);

  // set synchronously so children's effects/requests already see the token
  setAuth(session?.accessToken, session?.role);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session.role === "user") setUser(session.profile);
    else if (session.role === "captain") updateCaptain(session.profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.accessToken]);

  return children;
}
