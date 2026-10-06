import { useEffect, useId, useRef } from "react";
import Button from "../Button/Button";
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({ open, title = "Confirmar exclusão", description, error, pending = false, confirmLabel = "Confirmar exclusão", pendingLabel = "Excluindo…", onConfirm, onCancel }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={event => { event.preventDefault(); if (!pending) onCancel(); }}>
      <h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}><Button variant="secondary" disabled={pending} onClick={onCancel} autoFocus>Cancelar</Button>
        <Button variant="danger" loading={pending} loadingLabel={pendingLabel} onClick={onConfirm}>{confirmLabel}</Button></div>
    </dialog>
  );
}
