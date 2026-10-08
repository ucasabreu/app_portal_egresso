import { useCallback, useRef, useState } from "react";
import { errorMessage } from "../utils/presentation";

export default function useMutation() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const pending = useRef(false);
  const [error, setError] = useState(null);
  const clearNotice = useCallback(() => { setNotice(null); setError(null); }, []);
  const run = async (operation, success, after) => {
    if (pending.current) return false;
    pending.current = true; setBusy(true); setNotice(null); setError(null);
    try {
      await operation();
      setNotice({ variant: "success", text: success });
      after?.();
      return true;
    } catch (error) { setError(error); setNotice({ variant: "error", text: errorMessage(error) }); return false; }
    finally { pending.current = false; setBusy(false); }
  };
  return { busy, notice, error, clearNotice, run };
}
