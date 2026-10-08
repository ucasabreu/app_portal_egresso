import { useContext, useEffect } from "react";
import { SessionExitContext } from "../auth/SessionExitContext.js";

export default function useSessionExitGuard({ dirty, pending, release, retain }) {
  const context = useContext(SessionExitContext);
  const registerGuard = context?.registerGuard;
  useEffect(() => registerGuard?.({ dirty, pending, release, retain }), [registerGuard, dirty, pending, release, retain]);
  return context?.exiting || false;
}
