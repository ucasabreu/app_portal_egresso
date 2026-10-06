import { useEffect, useRef, useState } from "react";
import Field from "./Field";
import TextArea from "../TextArea/TextArea";
import Button from "../Button/Button";
import Notice from "../feedback/Notice";
import ConfirmDialog from "./ConfirmDialog";
import HighlightPreview from "./HighlightPreview";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import readImageFile from "../../utils/readImageFile.js";
import { IMAGE_ACCEPT, IMAGE_HINT } from "../../utils/imagePolicy.js";
import { highlightErrors, focusFirstError } from "../../utils/management.js";
import styles from "./ManagementForm.module.css";

const empty = { titulo: "", noticia: "", feitoDestaque: "", imagem: "" };
export default function HighlightComposer({ egresso, busy, onPublish, onClose }) {
  const [values, setValues] = useState(empty);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [discard, setDiscard] = useState(false);
  const [compact, setCompact] = useState(false);
  const form = useRef(null);
  const focusError = useRef(false);
  const heading = useRef(null);
  const imageRevision = useRef(0);
  const dirty = Object.values(values).some(Boolean);
  const blocker = useUnsavedChanges(dirty, busy);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView?.({ block: "start", behavior: "auto" }); }, [step]);
  useEffect(() => () => { imageRevision.current += 1; }, []);
  const change = event => { const { name, value } = event.target; setValues(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: "" })); };
  const upload = async event => {
    const file = event.target.files[0];
    if (!file) return;
    const revision = ++imageRevision.current;
    setReading(true); setImageError("");
    try {
      const image = await readImageFile(file);
      if (imageRevision.current === revision) { setValues(current => ({ ...current, imagem: image })); setFileName(file.name); setErrors(current => ({ ...current, imagem: "" })); }
    } catch (error) { if (imageRevision.current === revision) { setImageError(error.message); event.target.value = ""; } }
    finally { if (imageRevision.current === revision) setReading(false); }
  };
  const submit = async event => {
    event.preventDefault();
    if (busy || reading || imageError) return;
    const nextErrors = highlightErrors({ ...values, imagem: fileName ? "" : values.imagem });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { focusError.current = true; setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    if (await onPublish(values)) { setValues(empty); onClose(); }
  };
  useEffect(() => {
    const active = Object.fromEntries(Object.entries(errors).filter(([, value]) => value));
    if (focusError.current && Object.keys(active).length) { focusError.current = false; focusFirstError(form.current, active); }
  }, [errors]);
  return (
    <section className={styles.panel} aria-labelledby="create-highlight-title">
      <p className={styles.step}>Etapa {step} de 2 · {step === 1 ? "Conteúdo" : "Revisão"}</p>
      <h2 id="create-highlight-title" ref={heading} tabIndex={-1}>Novo destaque: {egresso.nome}</h2>
      <form ref={form} onSubmit={submit} noValidate aria-busy={busy || reading} className={styles.form}>
        {step === 1 ? <>
          <Field label="Título" name="titulo" value={values.titulo} onChange={change} error={errors.titulo} hint={`${values.titulo.length}/100 caracteres. Letras, números e espaços; sem pontuação.`} required disabled={busy} />
          <Field label="Conquista em destaque" name="feitoDestaque" value={values.feitoDestaque} onChange={change} error={errors.feitoDestaque} hint={`${values.feitoDestaque.length}/255 caracteres. Resuma o reconhecimento.`} required disabled={busy} />
          <Field as={TextArea} label="Notícia" name="noticia" value={values.noticia} onChange={change} error={errors.noticia} hint="Texto simples; os parágrafos serão preservados na publicação." rows={7} required disabled={busy} />
          <div className={styles.columns}>
            <Field type="file" label="Imagem do destaque" accept={IMAGE_ACCEPT} onChange={upload} error={imageError} hint={reading ? "Preparando imagem…" : IMAGE_HINT} disabled={busy || reading} />
            <Field label="Ou use uma URL de imagem" name="imagem" type="url" value={fileName ? "" : values.imagem} onChange={change} error={errors.imagem} disabled={busy || reading || !!fileName} placeholder="https://" />
          </div>
          {imageError && <Button variant="secondary" onClick={() => setImageError("")}>Continuar com a imagem anterior ou sem arquivo</Button>}
          {fileName && <div className={styles.file}><p>Imagem selecionada: {fileName}</p><Button variant="secondary" disabled={busy || reading} onClick={() => { setFileName(""); setValues(current => ({ ...current, imagem: "" })); setImageError(""); }}>Remover imagem</Button></div>}
        </> : <>
          <Notice title="Confira antes de publicar"><p>A publicação será associada a {egresso.nome}. Ao confirmar, ela ficará disponível na galeria e no perfil.</p></Notice>
          <div className={styles.actions}><Button variant="secondary" aria-pressed={compact} onClick={() => setCompact(value => !value)}>{compact ? "Ver artigo completo" : "Ver prévia do cartão"}</Button></div>
          <HighlightPreview values={values} egresso={egresso} compact={compact} />
        </>}
        <div className={styles.actions}>
          <Button variant="secondary" disabled={busy || reading} onClick={() => dirty ? setDiscard(true) : onClose()}>Cancelar</Button>
          {step === 2 && <Button variant="secondary" disabled={busy} onClick={() => setStep(1)}>Continuar editando</Button>}
          <Button type="submit" disabled={reading || !!imageError} loading={busy} loadingLabel="Publicando…">{step === 1 ? "Revisar destaque" : "Publicar destaque"}</Button>
        </div>
      </form>
      <ConfirmDialog open={discard} title="Descartar este destaque?" description="O conteúdo ainda não foi publicado. Você perderá as alterações deste formulário." confirmLabel="Descartar alterações" onCancel={() => setDiscard(false)} onConfirm={onClose} />
      <UnsavedChangesDialog blocker={blocker} pending={busy} />
    </section>
  );
}
