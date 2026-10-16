"use client";
import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useNavigate } from "@/lib/router";
import axios from "../utils/axios";
import { UserDataContext } from "../context/UserContext";
import { CaptainDataContext } from "../context/CaptainContext";

const CONFIG = {
  user: { login: "/userlogin", profile: "/users/profile", key: "user" },
  captain: { login: "/captainlogin", profile: "/captain/profile", key: "captain" },
};

/**
 * Protects a page. The NextAuth session alone is not trusted: on every mount the
 * account is re-fetched from the database. If it no longer exists the API answers
 * 401 and the axios interceptor signs the user out.
 * returns "checking" | "ok" | "error" (+ retry)
 */
export default function useVerifiedAccount(role) {
  const cfg = CONFIG[role];
  const navigate = useNavigate();
  const { data: session, status } = useSession();
  const { setUser } = useContext(UserDataContext);
  const { updateCaptain } = useContext(CaptainDataContext);
  const [state, setState] = useState("checking");
  const [attempt, setAttempt] = useState(0);

  const allowed = status === "authenticated" && session.role === role;
  const token = session?.accessToken;

  useEffect(() => {
    if (status !== "loading" && !allowed) navigate(cfg.login, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, allowed]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    setState("checking");
    axios
      .get(cfg.profile)
      .then((res) => {
        if (cancelled) return;
        const account = res.data?.[cfg.key];
        if (!account?._id) throw new Error("Account not found");
        if (role === "user") setUser(account);
        else updateCaptain(account);
        setState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        // 401 => interceptor is already signing the user out
        if (err.response?.status !== 401) setState("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, token, attempt]);

  return { state: allowed ? state : "checking", retry: () => setAttempt((a) => a + 1) };
}
