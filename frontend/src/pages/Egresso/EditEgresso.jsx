import { useAuth } from "../../auth/AuthContext.js";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../config/config.js";
import { errorMessage } from "../../utils/presentation";
import { profileErrors, focusFirstError } from "../../utils/management.js";
import { IMAGE_ACCEPT, IMAGE_HINT } from "../../utils/imagePolicy.js";
import readImageFile from "../../utils/readImageFile";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import UnsavedChangesDialog from "../../components/ui/UnsavedChangesDialog";
import PageShell from "../../components/ui/PageShell";
import Field from "../../components/ui/Field";
import Photo from "../../components/ui/Photo";
import TextArea from "../../components/TextArea/TextArea";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import Notice from "../../components/feedback/Notice";
import styles from "./Editor.module.css";
import content from "../../styles/Content.module.css";

const empty = { foto: "", nome: "", email: "", linkedin: "", instagram: "", curriculo: "", descricao: "" };
const profileValues = data => Object.fromEntries(Object.keys(empty).map(key => [key, typeof data[key] === "string" ? data[key] : ""]));
const steps = ["Identificação", "Apresentação e contatos", "Revisão"];
export default function EditEgresso() {
  const auth = useAuth();
  const [senha, setSenha] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const [egresso, setEgresso] = useState(empty);
  const [original, setOriginal] = useState(empty);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const imageRevision = useRef(0);
  const form = useRef(null);
  const focusError = useRef(false);
  const heading = useRef(null);
  const blocker = useUnsavedChanges(!loading && (JSON.stringify(egresso) !== JSON.stringify(original) || !!senha), saving);
  useEffect(() => {
    const controller = new AbortController();
    setStep(1); setError(""); setErrors({}); setLoadError("");
    if (!id) { setEgresso(empty); setOriginal(empty); setLoading(false); return; }
    setLoading(true);
    axios.get(API_URL + "/api/egressos/buscar/egresso/" + id, { signal: controller.signal })
      .then(({ data }) => { if (!data?.id_egresso) throw new Error("Este perfil não foi encontrado."); if (!controller.signal.aborted) { const values = profileValues(data); setEgresso(values); setOriginal(values); } })
      .catch(error => { if (!controller.signal.aborted) setLoadError(errorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, revision]);
  useEffect(() => { heading.current?.focus(); }, [step, loading]);
  useEffect(() => () => { imageRevision.current += 1; }, []);
  useEffect(() => {
    const active = Object.fromEntries(Object.entries(errors).filter(([, value]) => value));
    if (focusError.current && Object.keys(active).length) { focusError.current = false; focusFirstError(form.current, active); }
  }, [errors, step]);
  const change = event => { const { name, value } = event.target; setEgresso(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: "" })); };
  const upload = async event => {
    const file = event.target.files[0];
    if (!file) return;
    const current = ++imageRevision.current;
    setPhotoLoading(true); setPhotoError("");
    try { const foto = await readImageFile(file); if (current === imageRevision.current) setEgresso(value => ({ ...value, foto })); }
    catch (error) { if (current === imageRevision.current) { setPhotoError(error.message); event.target.value = ""; } }
    finally { if (current === imageRevision.current) setPhotoLoading(false); }
  };
  const submit = async event => {
    event.preventDefault();
    if (pending.current || photoLoading || photoError) return;
    const all = profileErrors(egresso);
    if (!id || senha) {
      if (senha.length < 8 || senha.length > 128) all.senha = "Use uma senha de 8 a 128 caracteres.";
      if (senha !== confirmationPassword) all.confirmationPassword = "As senhas precisam ser iguais.";
    }
    const next = step === 1 ? Object.fromEntries(Object.entries(all).filter(([key]) => ["nome", "email", "senha", "confirmationPassword"].includes(key))) : all;
    setErrors(next);
    if (Object.keys(next).length) { focusError.current = true; setStep(next.nome || next.email || next.senha || next.confirmationPassword ? 1 : 2); return; }
    if (step < 3) { setStep(value => value + 1); return; }
    pending.current = true; setSaving(true); setError("");
    try {
      const payload = profileValues(egresso);
      let savedId;
      if (id) {
        const response = await axios.put(API_URL + "/api/egressos/atualizar/egresso/" + id, payload);
        savedId = response.data?.id_egresso;
        if (senha && auth.user?.role === "geral") await axios.post(API_URL + "/api/gestao/egressos/" + id + "/senha", { senha });
      } else savedId = (await auth.register({ ...payload, senha })).id;
      if (savedId == null) throw new Error("O serviço não retornou a identificação do perfil salvo.");
      setSenha(""); setConfirmationPassword(""); setOriginal(egresso); blocker.release(); navigate("/egresso/" + savedId);
    } catch (error) { setError(errorMessage(error)); }
    finally { pending.current = false; setSaving(false); }
  };
  return (
    <PageShell eyebrow={id ? "Atualize sua trajetória" : "Faça parte da comunidade"} title={id ? "Seu perfil, sempre em movimento." : "Sua história merece um lugar aqui."}
      description="Apresente sua trajetória em três passos. Depois de salvar, você poderá registrar cursos, experiências e depoimentos."
      actions={<Link className={content.link} to={id ? "/egresso_view/" + id : "/egressos/listar"}>← Voltar</Link>}>
      {loading ? <LoadingState label="Carregando perfil…" /> : loadError ? <ErrorState description={loadError} onRetry={() => setRevision(value => value + 1)} /> : <div className={styles.layout}>
        <aside className={styles.preview}><Photo src={egresso.foto} alt="" width={128} height={128} /><h2>{egresso.nome || "Seu perfil no portal"}</h2><p>Uma apresentação para conectar sua formação aos próximos capítulos da sua história.</p></aside>
        <form ref={form} className={styles.form} onSubmit={submit} noValidate aria-busy={saving}>
          <ol className={styles.steps} aria-label="Etapas do perfil">{steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined}><span>{index + 1}</span>{label}</li>)}</ol>
          <h2 ref={heading} tabIndex={-1} className={styles.stepTitle}>{steps[step - 1]}</h2>
          {error && <Notice variant="error"><p>{error}</p></Notice>}
          {step === 1 && <>
            <Field label="Foto de perfil" name="fotoFile" type="file" accept={IMAGE_ACCEPT} onChange={upload} error={photoError} hint={photoLoading ? "Preparando imagem…" : IMAGE_HINT} disabled={saving || photoLoading} />
            {(egresso.foto || photoError) && <Button variant="secondary" disabled={saving || photoLoading} onClick={() => { setEgresso(value => ({ ...value, foto: "" })); setPhotoError(""); }}>Usar sem foto</Button>}
            <Field label="Nome completo" name="nome" autoComplete="name" value={egresso.nome} onChange={change} error={errors.nome} required disabled={saving} />
            <Field label="E-mail" name="email" type="email" autoComplete="email" value={egresso.email} onChange={change} error={errors.email} required disabled={saving} />
            {(!id || auth.user?.role === "geral") && <>
              <Field label={id ? "Nova senha de acesso" : "Senha de acesso"} name="senha" type="password" autoComplete="new-password" value={senha} onChange={event => setSenha(event.target.value)} error={errors.senha} hint={id ? "Opcional. Define uma nova senha para este egresso." : "Use de 8 a 128 caracteres para acessar sua área."} maxLength={128} disabled={saving} required={!id} />
              <Field label="Confirmar senha" name="confirmationPassword" type="password" autoComplete="new-password" value={confirmationPassword} onChange={event => setConfirmationPassword(event.target.value)} error={errors.confirmationPassword} maxLength={128} disabled={saving} required={!id || !!senha} />
            </>}
          </>}
          {step === 2 && <>
            <Field as={TextArea} label="Sobre você" name="descricao" value={egresso.descricao} onChange={change} placeholder="Conte um pouco sobre sua formação, atuação e interesses." rows={5} disabled={saving} />
            {[["linkedin", "LinkedIn"], ["instagram", "Instagram"], ["curriculo", "Link do currículo"]].map(([name, label]) => <Field key={name} label={label} name={name} type="url" value={egresso[name]} onChange={change} error={errors[name]} placeholder="https://" disabled={saving} />)}
          </>}
          {step === 3 && <>
            <Notice title="Confira sua apresentação"><p>Estes são os dados que serão salvos no perfil público.</p></Notice>
            <dl className={styles.review}>{[["nome", "Nome"], ["email", "E-mail"], ["descricao", "Apresentação"], ["linkedin", "LinkedIn"], ["instagram", "Instagram"], ["curriculo", "Currículo"]].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{egresso[key] || "Não informado"}</dd></div>)}</dl>
          </>}
          <div className={styles.actions}>{step > 1 && <Button variant="secondary" disabled={saving} onClick={() => setStep(value => value - 1)}>{step === 3 ? "Continuar editando" : "Voltar à identificação"}</Button>}<Button type="submit" loading={saving} disabled={photoLoading || !!photoError} loadingLabel="Salvando perfil…">{step === 1 ? "Continuar" : step === 2 ? "Revisar dados" : "Salvar perfil"}</Button></div>
        </form>
      </div>}
      <UnsavedChangesDialog blocker={blocker} pending={saving} />
    </PageShell>
  );
}
