import { useId, useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IMAGE_ACCEPT, IMAGE_HINT } from "../../utils/imagePolicy.js";
import styles from "./ImageUpload.module.css";

export default function ImageUpload({ onSelect, disabled = false, reading = false, error, fileName }) {
  const id = useId();
  const input = useRef(null);
  const select = file => { if (!disabled && file) { if (input.current) input.current.value = ""; return onSelect(file, input.current); } };
  return <div className={styles.upload}>
    <label className={styles.dropzone} htmlFor={id} aria-disabled={disabled} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); select(event.dataTransfer.files[0]); }}>
      <FaCloudUploadAlt aria-hidden="true" /><strong>{reading ? "Preparando imagem…" : fileName ? "Trocar imagem selecionada" : "Clique para enviar uma imagem"}</strong><span>ou arraste o arquivo até aqui</span><small id={id + "-hint"}>{IMAGE_HINT}</small>
      <input ref={input} id={id} name="imagemFile" type="file" accept={IMAGE_ACCEPT} aria-label="Selecionar imagem da publicação" aria-describedby={id + "-hint" + (error ? " " + id + "-error" : "")} aria-invalid={!!error} disabled={disabled} onChange={event => select(event.target.files[0])} />
    </label>
    {error && <p className={styles.error} id={id + "-error"} role="alert">{error}</p>}
  </div>;
}
