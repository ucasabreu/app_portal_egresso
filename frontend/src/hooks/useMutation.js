import { useRef, useState } from "react";
import { errorMessage } from "../utils/presentation";

export default function useMutation() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const pending = useRef(false);
  const run = async (operation, success, after) => {
    if (pending.current) return false;
    pending.current = true; setBusy(true); setNotice(null);
    try {
      await operation();
      setNotice({ variant: "success", text: success });
      after?.();
      return true;
    } catch (error) { setNotice({ variant: "error", text: errorMessage(error) }); return false; }
    finally { pending.current = false; setBusy(false); }
  };
  return { busy, notice, run };
}
