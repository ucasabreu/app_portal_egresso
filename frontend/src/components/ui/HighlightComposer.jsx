import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaRegSave } from "react-icons/fa";
import ImageUpload from "./ImageUpload";
import Field from "./Field";
import TextArea from "../TextArea/TextArea";
import Button from "../Button/Button";
import Notice from "../feedback/Notice";
import ConfirmDialog from "./ConfirmDialog";
import HighlightPreview from "./HighlightPreview";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import readImageFile from "../../utils/readImageFile.js";
import { highlightErrors, draftErrors, focusFirstError } from "../../utils/management.js";
import { errorMessage } from "../../utils/presentation.js";
import styles from "./ManagementForm.module.css";

const empty = { titulo: "", noticia: "", feitoDestaque: "", imagem: "" };
const contentValues = source => Object.fromEntries(Object.keys(empty).map(key => [key, typeof source[key] === "string" ? source[key] : ""]));
export default function HighlightComposer({ egresso, busy, onPublish, onClose, initialValues = empty, initialDraft = null, editing = false, onSaveDraft, operationError, onReloadDraft, onStateChange }) {
  const [values, setValues] = useState(() => contentValues(initialValues));
  const [snapshot, setSnapshot] = useState(() => JSON.stringify(contentValues(initialValues)));
  const [draft, setDraft] = useState(initialDraft);
  const [draftSaved, setDraftSaved] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState(() => initialValues.imagem?.startsWith("data:image/") ? "Imagem salva" : "");
  const [reading, setReading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [discard, setDiscard] = useState(false);
  const [compact, setCompact] = useState(true);
  const [operation, setOperation] = useState("");
  const [conflicted, setConflicted] = useState(false);
  const [reloadConfirmation, setReloadConfirmation] = useState(false);
  const form = useRef(null);
  const focusError = useRef(false);
  const heading = useRef(null);
  const imageRevision = useRef(0);
  const pending = useRef(false);
  const dirty = JSON.stringify(values) !== snapshot;
  const locked = Boolean(busy || operation || reading);
  const blocker = useUnsavedChanges(dirty, locked);
  const { release, retain } = blocker;
  useEffect(() => { onStateChange?.({ dirty, pending: locked, release, retain }); }, [dirty, locked, release, retain, onStateChange]);
  useEffect(() => { if (operationError?.response?.status === 409 && draft) setConflicted(true); }, [operationError, draft]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView?.({ block: "start", behavior: "auto" }); }, [step]);
  useEffect(() => () => { imageRevision.current += 1; }, []);
  useEffect(() => {
    const active = Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
    if (focusError.current && Object.keys(active).length) { focusError.current = false; focusFirstError(form.current, active); }
  }, [errors, step]);
  const change = event => { const { name, value } = event.target; setValues(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: "" })); setDraftSaved(false); };
  const upload = async (file, input) => {
    if (!file || pending.current || busy) return;
    const revision = ++imageRevision.current;
    setReading(true); setImageError(""); setDraftSaved(false);
    try {
      const image = await readImageFile(file);
      if (imageRevision.current === revision) { setValues(current => ({ ...current, imagem: image })); setFileName(file.name); setErrors(current => ({ ...current, imagem: "" })); }
    } catch (error) { if (imageRevision.current === revision) { setImageError(error.message); if (input) input.value = ""; } }
    finally { if (imageRevision.current === revision) setReading(false); }
  };
  const validate = rule => {
    const result = rule({ ...values, imagem: fileName || values.imagem === initialValues.imagem ? "" : values.imagem });
    setErrors(result);
    if (Object.keys(result).length) { focusError.current = true; setStep(1); return false; }
    return true;
  };
  const persistDraft = async () => {
    const saved = await onSaveDraft(values, draft);
    if (saved) { setDraft(saved); setSnapshot(JSON.stringify(values)); setDraftSaved(true); }
    return saved;
  };
  const saveDraft = async () => {
    if (locked || pending.current || imageError || conflicted || !onSaveDraft || !validate(draftErrors)) return false;
    pending.current = true; setOperation("draft");
    try { return await persistDraft(); } finally { pending.current = false; setOperation(""); }
  };
  const submit = async event => {
    event.preventDefault();
    if (locked || pending.current || imageError || conflicted || !validate(highlightErrors)) return;
    if (step === 1) { setStep(2); return; }
    pending.current = true; setOperation("publish");
    try {
      let source = draft;
      if (source && dirty) { source = await persistDraft(); if (!source) return; }
      if (await onPublish(values, source)) { setValues(empty); release(); onClose(); }
    } finally { pending.current = false; setOperation(""); }
  };
  const reloadDraft = async () => {
    if (locked || pending.current || !draft || !onReloadDraft) return;
    pending.current = true; setOperation("reload");
    try {
      const saved = await onReloadDraft(draft.id);
      if (!saved) return;
      const content = contentValues(saved);
      setValues(content); setSnapshot(JSON.stringify(content)); setDraft(saved); setDraftSaved(false);
      setFileName(content.imagem.startsWith("data:image/") ? "Imagem salva" : ""); setImageError(""); setErrors({});
      setConflicted(false); setReloadConfirmation(false); setStep(1);
    } finally { pending.current = false; setOperation(""); }
  };
  return (
    <section className={styles.panel} aria-labelledby="create-highlight-title">
      <header className={styles.heading}><p className={styles.step}>Etapa {step} de 2 · {step === 1 ? "Conteúdo" : "Revisão"}</p>
        <h2 id="create-highlight-title" ref={heading} tabIndex={-1}>{editing ? "Editar destaque" : draft ? "Rascunho de destaque" : "Novo destaque"}: {egresso.nome}</h2>
        <p>Escreva a conquista, confira a apresentação e escolha quando publicá-la.</p>
      </header>
      {draftSaved && <Notice className={styles.notice} title="Rascunho salvo"><p>Esta versão está salva no banco e pode ser retomada em outra máquina. Ela ainda não aparece na galeria pública.</p></Notice>}
      {conflicted && <Notice className={styles.notice} variant="warning" title="O rascunho mudou em outra sessão"><p>Seu conteúdo foi mantido neste formulário. Para salvar ou publicar, carregue a versão atual. Copie antes os trechos locais que deseja preservar.</p><Button variant="secondary" disabled={locked} onClick={() => setReloadConfirmation(true)}>Carregar versão salva</Button></Notice>}
      <div className={styles.editorLayout}>
        <form ref={form} onSubmit={submit} noValidate aria-busy={locked} className={styles.form}>
          {step === 1 ? <>
            <Field label="Título" name="titulo" value={values.titulo} onChange={change} error={errors.titulo} maxLength={100} hint={`${values.titulo.length}/100 caracteres. Letras, números e espaços; sem pontuação.`} required disabled={locked} />
            <Field label="Conquista em destaque" name="feitoDestaque" value={values.feitoDestaque} onChange={change} error={errors.feitoDestaque} maxLength={255} hint={`${values.feitoDestaque.length}/255 caracteres. Resuma o reconhecimento.`} required disabled={locked} />
            <Field as={TextArea} label="Notícia" name="noticia" value={values.noticia} onChange={change} error={errors.noticia} maxLength={100000} hint="Texto simples; os parágrafos serão preservados na publicação." rows={6} required disabled={locked} />
            <fieldset className={styles.imageFields}><legend>Imagem da publicação</legend>
              <ImageUpload onSelect={upload} disabled={locked} reading={reading} error={imageError} fileName={fileName} />
              <details className={styles.imageUrl} open={!!errors.imagem || !!initialValues.imagem && !initialValues.imagem.startsWith("data:image/")}><summary>Ou usar uma URL de imagem</summary><Field label="Endereço da imagem" name="imagem" type="url" value={fileName ? "" : values.imagem} onChange={change} error={errors.imagem} disabled={locked || !!fileName} placeholder="https://" /></details>
            </fieldset>
            {imageError && <Button variant="secondary" disabled={locked} onClick={() => setImageError("")}>Continuar com a imagem anterior ou sem arquivo</Button>}
            {fileName && <div className={styles.file}><p>Imagem selecionada: {fileName}</p><Button variant="secondary" disabled={locked} onClick={() => { setFileName(""); setValues(current => ({ ...current, imagem: "" })); setImageError(""); setDraftSaved(false); const input = form.current?.querySelector('[name="imagemFile"]'); if (input) input.value = ""; }}>Remover imagem</Button></div>}
          </> : <Notice title="Confira antes de confirmar"><p>O conteúdo será associado a {egresso.nome}. {editing ? "A publicação atual permanece disponível até você salvar as alterações." : "Ao publicar, ele ficará disponível na galeria e no perfil."}</p></Notice>}
          <div className={styles.actions}>
            <Button variant="secondary" disabled={locked} onClick={() => dirty ? setDiscard(true) : onClose()}>Cancelar</Button>
            {!editing && onSaveDraft && <Button variant="secondary" disabled={locked || !!imageError || conflicted} loading={operation === "draft"} loadingLabel="Salvando rascunho…" onClick={saveDraft}><FaRegSave aria-hidden="true" />Salvar rascunho</Button>}
            {step === 2 && <Button variant="secondary" disabled={locked} onClick={() => setStep(1)}>Continuar editando</Button>}
            <Button type="submit" disabled={locked || !!imageError || conflicted} loading={operation === "publish"} loadingLabel="Salvando publicação…">{step === 1 ? "Revisar destaque" : editing ? "Salvar alterações" : "Publicar destaque"}<FaPaperPlane aria-hidden="true" /></Button>
          </div>
        </form>
        <aside className={styles.previewPane} aria-label="Prévia do conteúdo"><div className={styles.previewHeading}><h3>Prévia da apresentação</h3><Button variant="secondary" aria-pressed={compact} onClick={() => setCompact(value => !value)}>{compact ? "Ver artigo completo" : "Ver prévia do cartão"}</Button></div>
          <HighlightPreview values={values} egresso={egresso} compact={compact} editing={editing} publicationDate={initialValues.dataPublicacao} />
          <p className={styles.previewHint}>Prévia para revisão. O conteúdo só muda no portal depois da confirmação.</p>
        </aside>
      </div>
      <ConfirmDialog open={discard} pending={locked} title="Descartar alterações não salvas?" description="As alterações deste formulário serão descartadas. Se houver um rascunho salvo, ele será preservado no painel." confirmLabel="Descartar alterações" onCancel={() => setDiscard(false)} onConfirm={() => { release(); onClose(); }} />
      <ConfirmDialog open={reloadConfirmation} pending={locked} pendingLabel="Carregando versão…" error={operationError ? errorMessage(operationError) : undefined} title="Carregar a versão salva no banco?" description="O formulário será substituído pela versão atual do rascunho. Copie antes os trechos locais que deseja preservar. Nenhuma versão será sobrescrita ao carregar." confirmLabel="Substituir pela versão salva" onCancel={() => setReloadConfirmation(false)} onConfirm={reloadDraft} />
      <UnsavedChangesDialog blocker={blocker} pending={locked} />
    </section>
  );
}
