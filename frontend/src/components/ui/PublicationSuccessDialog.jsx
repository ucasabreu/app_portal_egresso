import { useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import Button from "../Button/Button";
import styles from "./PublicationSuccessDialog.module.css";

export default function PublicationSuccessDialog({ result, onClose }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => { const dialog = ref.current; if (result && !dialog.open) dialog.showModal(); if (!result && dialog.open) dialog.close(); }, [result]);
  return <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => { event.preventDefault(); onClose(); }}>
    <button type="button" className={styles.close} aria-label="Fechar confirmação" onClick={onClose}><FaTimes aria-hidden="true" /></button>
    <FaCheckCircle className={styles.icon} aria-hidden="true" /><h2 id={titleId}>{result?.editing ? "Publicação atualizada!" : "Publicação realizada!"}</h2><p id={descriptionId}>O conteúdo foi salvo e está disponível no portal.</p>
    <div className={styles.actions}>{result?.id != null && <Link to={"/destaques/" + result.id} onClick={onClose}>Ver publicação</Link>}<Button variant="secondary" onClick={onClose} autoFocus>Fechar</Button></div>
  </dialog>;
}
