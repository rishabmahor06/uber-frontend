"use client";
// Thin react-router-dom compatible layer on top of the Next.js App Router.
import NextLink from "next/link";
import { useEffect } from "react";
import { useRouter, usePathname, useParams as useNextParams } from "next/navigation";

const STATE_KEY = "navState";

export function Link({ to, href, ...props }) {
  return <NextLink href={to ?? href ?? "#"} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return (to, options = {}) => {
    try {
      if (options.state) sessionStorage.setItem(STATE_KEY, JSON.stringify(options.state));
      else sessionStorage.removeItem(STATE_KEY);
    } catch {}
    if (options.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  let state = null;
  try {
    state = JSON.parse(sessionStorage.getItem(STATE_KEY) || "null");
  } catch {}
  return { pathname, state };
}

export function useParams() {
  return useNextParams() || {};
}

export function Navigate({ to }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
}
