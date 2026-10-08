import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import { errorMessage } from "../../utils/presentation";
import useSessionExitGuard from "../../hooks/useSessionExitGuard.js";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import UnsavedChangesDialog from "../../components/ui/UnsavedChangesDialog";
import { trajectoryErrors, focusFirstError } from "../../utils/management.js";
import useProfile from "../../hooks/useProfile";
import useCollection from "../../hooks/useCollection";
import Container from "../../components/ui/Container";
import EditorialHeader from "../../components/ui/EditorialHeader";
import ProfileDetails from "../../components/ui/ProfileDetails";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import TextArea from "../../components/TextArea/TextArea";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import Notice from "../../components/feedback/Notice";
import styles from "./Editor.module.css";
import content from "../../styles/Content.module.css";

const emptyCargo = { descricao: "", local: "", ano_inicio: "", ano_fim: "" };
const emptyCurso = { id_curso: "", ano_inicio: "", ano_fim: "" };
export default function Egresso() {
  const { id } = useParams();
  const profile = useProfile(id);
  const courses = useCollection("/api/consultas/listar/cursos");
  const [active, setActive] = useState("");
  const [cargo, setCargo] = useState(emptyCargo);
  const [curso, setCurso] = useState(emptyCurso);
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const pending = useRef(false);
  const form = useRef(null);
  const noticeRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(false);
  const [nextActive, setNextActive] = useState(null);
  const draft = active === "cargo" ? cargo : active === "curso" ? curso : active === "depoimento" ? { texto } : {};
  const dirty = Object.values(draft).some(Boolean);
  const blocker = useUnsavedChanges(dirty, busy);
  const exiting = useSessionExitGuard({ dirty, pending: busy, release: blocker.release, retain: blocker.retain });
  const locked = busy || exiting;
  const resetForm = next => { setCargo(emptyCargo); setCurso(emptyCurso); setTexto(""); setErrors({}); setReview(false); setActive(next); setNextActive(null); };
  const openForm = next => { if (pending.current || exiting) return; if (dirty) setNextActive(next); else resetForm(next); };
  const validate = () => {
    const next = trajectoryErrors(active, draft, courses.data);
    setErrors(next);
    if (Object.keys(next).length) { setReview(false); return false; }
    if (!review) { setReview(true); return false; }
    return true;
  };
  useEffect(() => { if (!review && Object.keys(errors).length) focusFirstError(form.current, errors); }, [errors, review]);
  useEffect(() => { form.current?.querySelector("h3")?.focus(); }, [active, review]);
  useEffect(() => { if (notice?.variant === "error") noticeRef.current?.focus(); }, [notice]);
  const run = async (operation, success) => {
    if (pending.current || exiting) return false;
    pending.current = true; setBusy(true); setNotice(null);
    try {
      await operation();
      setNotice({ variant: "success", text: success });
      profile.reload();
      return true;
    } catch (error) { setNotice({ variant: "error", text: errorMessage(error) }); return false; }
    finally { pending.current = false; setBusy(false); }
  };
  const saveCargo = async event => {
    event.preventDefault();
    if (pending.current || exiting || !validate()) return;
    if (await run(() => axios.post(API_URL + "/api/egressos/salvar/egresso/" + id + "/salvar_cargo", { ...cargo, ano_fim: cargo.ano_fim || null }), "Experiência registrada com sucesso.")) { setCargo(emptyCargo); resetForm(""); }
  };
  const saveCurso = async event => {
    event.preventDefault();
    if (courses.loading || courses.error) return;
    if (pending.current || exiting || !validate()) return;
    if (await run(() => axios.post(API_URL + "/api/egressos/salvar/egresso/" + id + "/curso/" + curso.id_curso + "/curso_egresso", { ...curso, ano_fim: curso.ano_fim || null }), "Curso registrado com sucesso.")) { setCurso(emptyCurso); resetForm(""); }
  };
  const saveDepoimento = async event => {
    event.preventDefault();
    if (pending.current || exiting || !validate()) return;
    if (await run(() => axios.post(API_URL + "/api/egressos/salvar/egresso/" + id + "/salvar_depoimento", { texto }), "Depoimento compartilhado com sucesso.")) { setTexto(""); resetForm(""); }
  };
  const remove = async () => {
    if (!confirmation || pending.current || exiting) return;
    const endpoints = { cargo: "cargo", curso: "curso_egresso", depoimento: "depoimento" };
    if (await run(() => axios.delete(API_URL + "/api/egressos/deletar/" + endpoints[confirmation.type] + "/" + confirmation.id), "Registro excluído com sucesso.")) setConfirmation(null);
  };
  const actions = <div className={styles.actions}><Button variant="secondary" disabled={locked} onClick={() => openForm("")}>Cancelar</Button><Button type="submit" loading={busy} loadingLabel="Salvando…">{review ? "Confirmar e salvar" : "Revisar registro"}</Button></div>;
  const yearField = (value, onChange, name, label, required) => <Field key={name} label={label} name={name} type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={value} onChange={onChange} error={errors[name]} hint={!required ? "Deixe vazio se estiver em andamento." : undefined} placeholder="Ex.: 2024" required={required} disabled={locked} />;
  const cargoChange = event => { setCargo(value => ({ ...value, [event.target.name]: event.target.value })); setErrors({}); };
  const cursoChange = event => { setCurso(value => ({ ...value, [event.target.name]: event.target.value })); setErrors({}); };
  const summary = entries => <div className={styles.full}><Notice title="Confira antes de salvar"><p>Este registro ficará visível na trajetória de {profile.egresso?.nome}.</p></Notice><dl className={styles.review}>{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Em andamento"}</dd></div>)}</dl><Button variant="secondary" disabled={locked} onClick={() => setReview(false)}>Continuar editando</Button></div>;
  const cargoAction = active === "cargo" ? (
    <form ref={form} className={styles.inlineForm} onSubmit={saveCargo} noValidate aria-busy={locked} aria-label="Registrar experiência">
      <h3 tabIndex={-1} className={styles.inlineTitle}>Registrar experiência</h3>
      {review ? summary([["Cargo", cargo.descricao], ["Local", cargo.local], ["Início", cargo.ano_inicio], ["Conclusão", cargo.ano_fim]]) : <>
      <Field label="Cargo ou atividade" name="descricao" error={errors.descricao} value={cargo.descricao} onChange={cargoChange} required disabled={locked} />
      <Field label="Local de atuação" name="local" error={errors.local} value={cargo.local} onChange={cargoChange} required disabled={locked} />
      {yearField(cargo.ano_inicio, cargoChange, "ano_inicio", "Ano de início", true)}
      {yearField(cargo.ano_fim, cargoChange, "ano_fim", "Ano de conclusão", false)}
      </>}
      {actions}
    </form>
  ) : <Button variant="secondary" className={styles.addAction} disabled={locked} onClick={() => openForm("cargo")}>Adicionar experiência</Button>;
  const cursoAction = active === "curso" ? (
    <form ref={form} className={styles.inlineForm} onSubmit={saveCurso} noValidate aria-busy={locked} aria-label="Registrar formação">
      <h3 tabIndex={-1} className={styles.inlineTitle}>Registrar formação</h3>
      {review ? summary([["Curso", courses.data.find(item => String(item.id_curso) === String(curso.id_curso))?.nome], ["Ingresso", curso.ano_inicio], ["Conclusão", curso.ano_fim]]) : <>
      {courses.error ? <div className={styles.full}><ErrorState description={courses.error} onRetry={courses.retry} /></div> : (
        <Field as={Select} className={styles.full} label="Curso" name="id_curso" error={errors.id_curso} value={curso.id_curso} onChange={cursoChange} required disabled={locked || courses.loading}>
          <option value="">{courses.loading ? "Carregando cursos…" : "Selecione seu curso"}</option>
          {courses.data.map(item => <option key={item.id_curso} value={item.id_curso}>{item.nome}</option>)}
        </Field>
      )}
      {yearField(curso.ano_inicio, cursoChange, "ano_inicio", "Ano de ingresso", true)}
      {yearField(curso.ano_fim, cursoChange, "ano_fim", "Ano de conclusão", false)}
      </>}
      <div className={styles.actions}><Button variant="secondary" disabled={locked} onClick={() => openForm("")}>Cancelar</Button><Button type="submit" loading={busy} disabled={courses.loading || !!courses.error} loadingLabel="Salvando…">{review ? "Salvar formação" : "Revisar formação"}</Button></div>
    </form>
  ) : <Button variant="secondary" className={styles.addAction} disabled={locked} onClick={() => openForm("curso")}>Adicionar formação</Button>;
  const depoimentoAction = active === "depoimento" ? (
    <form ref={form} className={styles.inlineForm} onSubmit={saveDepoimento} noValidate aria-busy={locked} aria-label="Compartilhar depoimento"><h3 tabIndex={-1} className={styles.inlineTitle}>Compartilhar experiência</h3>{review ? summary([["Depoimento", texto]]) : <Field as={TextArea} className={styles.full} label="Seu depoimento" name="texto" error={errors.texto} value={texto} onChange={event => { setTexto(event.target.value); setErrors({}); }} hint="Compartilhe uma experiência da sua trajetória. O relato será público." rows={6} required disabled={locked} />}{actions}</form>
  ) : <Button variant="secondary" className={styles.addAction} disabled={locked} onClick={() => openForm("depoimento")}>Adicionar depoimento</Button>;
  return (
    <Container className={styles.page}>
      <EditorialHeader breadcrumb={[{ label: "Início", to: "/" }, { label: "Meu espaço" }]} eyebrow="Construindo sua trajetória" title="O próximo capítulo começa por você." description="Complete sua formação e suas experiências para apresentar seu percurso à comunidade."
        actions={<><Link className={content.link} to={"/edit-egresso/" + id}>Editar dados pessoais →</Link><Link className={content.link} to={"/egresso_view/" + id}>Ver perfil público →</Link></>} />
      {notice && <Notice variant={notice.variant} ref={noticeRef} tabIndex={-1} className={styles.notice}><p>{notice.text}</p></Notice>}
      {profile.loading ? <LoadingState label="Atualizando trajetória…" /> : profile.error || !profile.egresso ? <ErrorState description={profile.error || "Perfil não encontrado."} onRetry={profile.reload} /> : (
        <>
          {profile.warnings.length > 0 && <Notice variant="warning" className={styles.notice}>{profile.warnings.map(message => <p key={message}>{message}</p>)}</Notice>}
          <ProfileDetails {...profile} cargoAction={cargoAction} cursoAction={cursoAction} depoimentoAction={depoimentoAction}
            renderDelete={(type, itemId) => <Button variant="ghost" disabled={locked} aria-label={"Excluir " + (type === "curso" ? "formação" : type === "cargo" ? "experiência" : "depoimento")} onClick={() => { setNotice(null); setConfirmation({ type, id: itemId, name: type === "curso" ? profile.cursos.find(item => item.id_curso_egresso === itemId)?.curso?.nome : type === "cargo" ? profile.cargos.find(item => item.id_cargo === itemId)?.descricao : "Depoimento de " + profile.egresso.nome }); }}>Excluir</Button>} />
        </>
      )}
      <ConfirmDialog open={!!confirmation} error={notice?.variant === "error" ? notice.text : undefined} pending={busy} description={`“${confirmation?.name || "Registro"}” será removido da trajetória de ${profile.egresso?.nome || "este egresso"}. A exclusão não pode ser desfeita.`} onCancel={() => setConfirmation(null)} onConfirm={remove} />
      <ConfirmDialog open={nextActive !== null} title="Descartar alterações do registro?" description="O registro ainda não foi salvo. Você perderá os dados deste formulário." confirmLabel="Descartar alterações" onCancel={() => setNextActive(null)} onConfirm={() => resetForm(nextActive)} />
      <UnsavedChangesDialog blocker={blocker} pending={busy} />
    </Container>
  );
}
