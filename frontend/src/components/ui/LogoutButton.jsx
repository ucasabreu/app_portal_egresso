import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext.js";
import { SessionExitContext } from "../../auth/SessionExitContext.js";
import Button from "../Button/Button";
import ConfirmDialog from "./ConfirmDialog";

export default function LogoutButton({ children = "Sair da conta", variant = "ghost", className = "" }) {
  const auth = useAuth();
  const context = useContext(SessionExitContext);
  const navigate = useNavigate();
  const [confirmExit, setConfirmExit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  const guard = context?.guard || {};
  const blocked = guard.pending || context?.exiting;
  const logout = async () => {
    if (running.current || blocked || context && !context.beginExit()) return;
    running.current = true; setBusy(true); setError("");
    guard.release?.();
    try {
      await auth.logout();
      setConfirmExit(false);
      navigate("/login", { replace: true });
    } catch {
      guard.retain?.();
      setError("Não foi possível encerrar a sessão. Seus dados não salvos foram mantidos. Tente novamente.");
      setConfirmExit(true);
    } finally {
      running.current = false; setBusy(false); context?.endExit();
    }
  };
  if (!auth?.user) return null;
  return <>
    <Button variant={variant} className={className} aria-label="Sair da conta" disabled={blocked} loading={busy} loadingLabel="Saindo…" onClick={() => {
      if (blocked || running.current) return;
      setError("");
      if (guard.dirty) setConfirmExit(true);
      else logout();
    }}><FaSignOutAlt aria-hidden="true" />{children}</Button>
    <ConfirmDialog open={confirmExit} title="Sair da conta?" description={guard.dirty ? "As alterações deste formulário ainda não foram salvas. Descarte os dados para encerrar a sessão ou cancele para continuar editando." : "Confirme para encerrar sua sessão no portal."}
      error={error} confirmLabel={guard.dirty ? "Descartar e sair da conta" : "Sair da conta"} pending={busy} pendingLabel="Saindo…" onCancel={() => { setConfirmExit(false); setError(""); }} onConfirm={logout} />
  </>;
}
