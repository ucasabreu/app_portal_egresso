import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import { errorMessage } from "../../utils/presentation";
import useProfile from "../../hooks/useProfile";
import useCollection from "../../hooks/useCollection";
import PageShell from "../../components/ui/PageShell";
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
  const run = async (operation, success) => {
    if (pending.current) return false;
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
    if (await run(() => axios.post(API_URL + "/api/egressos/salvar/egresso/" + id + "/salvar_cargo", cargo), "Experiência registrada com sucesso.")) { setCargo(emptyCargo); setActive(""); }
  };
  const saveCurso = async event => {
    event.preventDefault();
    if (await run(() => axios.post(API_URL + "/api/egressos/salvar/egresso/" + id + "/curso/" + curso.id_curso + "/curso_egresso", curso), "Curso registrado com sucesso.")) { setCurso(emptyCurso); setActive(""); }
  };
  const saveDepoimento = async event => {
    event.preventDefault();
    if (await run(() => axios.post(API_URL + "/api/egressos/salvar/egresso/" + id + "/salvar_depoimento", { texto }), "Depoimento compartilhado com sucesso.")) { setTexto(""); setActive(""); }
  };
  const remove = async () => {
    const endpoints = { cargo: "cargo", curso: "curso_egresso", depoimento: "depoimento" };
    if (await run(() => axios.delete(API_URL + "/api/egressos/deletar/" + endpoints[confirmation.type] + "/" + confirmation.id), "Registro excluído com sucesso.")) setConfirmation(null);
  };
  const actions = <div className={styles.actions}><Button variant="secondary" disabled={busy} onClick={() => setActive("")}>Cancelar</Button><Button type="submit" loading={busy} loadingLabel="Salvando…">Salvar</Button></div>;
  const yearField = (value, onChange, name, label, required) => <Field key={name} label={label} name={name} type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={value} onChange={onChange} placeholder="Ex.: 2024" required={required} disabled={busy} />;
  const cargoChange = event => setCargo(value => ({ ...value, [event.target.name]: event.target.value }));
  const cursoChange = event => setCurso(value => ({ ...value, [event.target.name]: event.target.value }));
  const cargoAction = active === "cargo" ? (
    <form className={styles.inlineForm} onSubmit={saveCargo}>
      <h3>Registrar experiência</h3>
      <Field label="Cargo ou atividade" name="descricao" value={cargo.descricao} onChange={cargoChange} required disabled={busy} />
      <Field label="Local de atuação" name="local" value={cargo.local} onChange={cargoChange} required disabled={busy} />
      {yearField(cargo.ano_inicio, cargoChange, "ano_inicio", "Ano de início", true)}
      {yearField(cargo.ano_fim, cargoChange, "ano_fim", "Ano de conclusão", false)}
      {actions}
    </form>
  ) : <Button variant="secondary" className={styles.addAction} disabled={busy} onClick={() => setActive("cargo")}>Adicionar experiência</Button>;
  const cursoAction = active === "curso" ? (
    <form className={styles.inlineForm} onSubmit={saveCurso}>
      <h3>Registrar formação</h3>
      {courses.error ? <div className={styles.full}><ErrorState description={courses.error} onRetry={courses.retry} /></div> : (
        <Field as={Select} className={styles.full} label="Curso" name="id_curso" value={curso.id_curso} onChange={cursoChange} required disabled={busy || courses.loading}>
          <option value="">{courses.loading ? "Carregando cursos…" : "Selecione seu curso"}</option>
          {courses.data.map(item => <option key={item.id_curso} value={item.id_curso}>{item.nome}</option>)}
        </Field>
      )}
      {yearField(curso.ano_inicio, cursoChange, "ano_inicio", "Ano de ingresso", true)}
      {yearField(curso.ano_fim, cursoChange, "ano_fim", "Ano de conclusão", true)}
      <div className={styles.actions}><Button variant="secondary" disabled={busy} onClick={() => setActive("")}>Cancelar</Button><Button type="submit" loading={busy} disabled={courses.loading || !!courses.error} loadingLabel="Salvando…">Salvar formação</Button></div>
    </form>
  ) : <Button variant="secondary" className={styles.addAction} disabled={busy} onClick={() => setActive("curso")}>Adicionar formação</Button>;
  const depoimentoAction = active === "depoimento" ? (
    <form className={styles.inlineForm} onSubmit={saveDepoimento}><h3>Compartilhar experiência</h3><Field as={TextArea} className={styles.full} label="Seu depoimento" value={texto} onChange={event => setTexto(event.target.value)} rows={5} required disabled={busy} />{actions}</form>
  ) : <Button variant="secondary" className={styles.addAction} disabled={busy} onClick={() => setActive("depoimento")}>Adicionar depoimento</Button>;
  return (
    <PageShell eyebrow="Construindo sua trajetória" title="O próximo capítulo começa por você." description="Complete sua formação e suas experiências para apresentar seu percurso à comunidade."
      actions={<><Link className={content.link} to={"/edit-egresso/" + id}>Editar dados pessoais →</Link><Link className={content.link} to={"/egresso_view/" + id}>Visualizar perfil →</Link></>}>
      {notice && <Notice variant={notice.variant} className={styles.notice}><p>{notice.text}</p></Notice>}
      {profile.loading ? <LoadingState label="Atualizando trajetória…" /> : profile.error || !profile.egresso ? <ErrorState description={profile.error || "Perfil não encontrado."} onRetry={profile.reload} /> : (
        <>
          {profile.warnings.length > 0 && <Notice variant="warning" className={styles.notice}>{profile.warnings.map(message => <p key={message}>{message}</p>)}</Notice>}
          <ProfileDetails {...profile} cargoAction={cargoAction} cursoAction={cursoAction} depoimentoAction={depoimentoAction}
            renderDelete={(type, itemId) => <Button variant="ghost" disabled={busy} onClick={() => setConfirmation({ type, id: itemId })}>Excluir</Button>} />
        </>
      )}
      <ConfirmDialog open={!!confirmation} error={notice?.variant === "error" ? notice.text : undefined} pending={busy} description="Este registro será removido da trajetória. A exclusão não pode ser desfeita." onCancel={() => setConfirmation(null)} onConfirm={remove} />
    </PageShell>
  );
}
