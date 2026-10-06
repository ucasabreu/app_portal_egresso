import { useEffect, useRef } from "react";
import Button from "../Button/Button";
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({ open, title = "Confirmar exclusão", description, error, pending = false, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="confirmation-title" aria-describedby="confirmation-description"
      onCancel={event => { event.preventDefault(); if (!pending) onCancel(); }}>
      <h2 id="confirmation-title">{title}</h2><p id="confirmation-description">{description}</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}><Button variant="secondary" disabled={pending} onClick={onCancel} autoFocus>Cancelar</Button>
        <Button variant="danger" loading={pending} loadingLabel="Excluindo…" onClick={onConfirm}>Confirmar exclusão</Button></div>
    </dialog>
  );
}
