"use client";
import { useEffect, useRef } from "react";

/**
 * Calls `fn` immediately and then every `ms` while `enabled` is true.
 * Used instead of websockets (serverless hosts such as Vercel can't keep sockets open).
 * Requests never overlap and polling pauses while the tab is hidden.
 */
export default function usePolling(fn, ms, enabled = true) {
  const latest = useRef(fn);
  latest.current = fn;

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let running = false;
    let timer;

    const tick = async () => {
      if (stopped) return;
      if (!running && !document.hidden) {
        running = true;
        try {
          await latest.current();
        } catch {
          /* transient network errors are retried on the next tick */
        }
        running = false;
      }
      if (!stopped) timer = setTimeout(tick, ms);
    };

    const onVisible = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    tick();

    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ms, enabled]);
}
