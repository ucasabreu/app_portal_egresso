import { useState } from "react";
import { FaLink } from "react-icons/fa";
import Button from "../Button/Button";
import Field from "./Field";
import styles from "./CopyLink.module.css";

export default function CopyLink({ path }) {
  const [state, setState] = useState({ busy: false, copied: false, manual: false });
  const url = new URL(path, window.location.origin).href;
  const copy = async () => {
    setState({ busy: true, copied: false, manual: false });
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Cópia indisponível");
      await navigator.clipboard.writeText(url);
      setState({ busy: false, copied: true, manual: false });
    } catch {
      setState({ busy: false, copied: false, manual: true });
    }
  };
  return (
    <div className={styles.share}>
      <Button variant="secondary" onClick={copy} loading={state.busy} loadingLabel="Copiando…"><FaLink aria-hidden="true" />Copiar link</Button>
      {state.copied && <p className={styles.status} role="status">Link copiado. Compartilhe esta página.</p>}
      {state.manual && <div className={styles.manual}>
        <p className={styles.status} role="status">Não foi possível copiar automaticamente. Selecione e copie o endereço abaixo.</p>
        <Field label="Endereço para compartilhar" value={url} readOnly onFocus={event => event.target.select()} />
      </div>}
    </div>
  );
}
