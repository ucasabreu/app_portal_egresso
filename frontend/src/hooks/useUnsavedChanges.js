import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export default function useUnsavedChanges(dirty, pending = false) {
  const released = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !released.current && (dirty || pending) && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  useEffect(() => {
    if (!dirty && !pending) return;
    const warn = event => { if (released.current) return; event.preventDefault(); event.returnValue = true; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);
  const { state, reset } = blocker;
  useEffect(() => { if (!dirty && !pending && state === "blocked") reset?.(); }, [dirty, pending, state, reset]);
  const release = useCallback(() => { released.current = true; }, []);
  const retain = useCallback(() => { released.current = false; }, []);
  return { ...blocker, release, retain };
}
