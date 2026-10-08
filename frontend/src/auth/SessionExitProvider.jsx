import { useCallback, useMemo, useRef, useState } from "react";
import { SessionExitContext } from "./SessionExitContext.js";

const emptyGuard = { dirty: false, pending: false };

export default function SessionExitProvider({ children }) {
  const [guard, setGuard] = useState(emptyGuard);
  const [exiting, setExiting] = useState(false);
  const running = useRef(false);
  const registerGuard = useCallback(next => {
    setGuard(next);
    return () => setGuard(current => current === next ? emptyGuard : current);
  }, []);
  const beginExit = useCallback(() => {
    if (running.current) return false;
    running.current = true;
    setExiting(true);
    return true;
  }, []);
  const endExit = useCallback(() => { running.current = false; setExiting(false); }, []);
  const value = useMemo(() => ({ guard, exiting, registerGuard, beginExit, endExit }), [guard, exiting, registerGuard, beginExit, endExit]);
  return <SessionExitContext.Provider value={value}>{children}</SessionExitContext.Provider>;
}
