import { useAuth } from "../../auth/AuthContext.js";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../config/config.js";
import { errorMessage } from "../../utils/presentation";
import { profileErrors, focusFirstError } from "../../utils/management.js";
import { IMAGE_ACCEPT, IMAGE_HINT } from "../../utils/imagePolicy.js";
import readImageFile from "../../utils/readImageFile";
import useSessionExitGuard from "../../hooks/useSessionExitGuard.js";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import UnsavedChangesDialog from "../../components/ui/UnsavedChangesDialog";
import Container from "../../components/ui/Container";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { FaCheck, FaLightbulb, FaRegFileAlt, FaUpload, FaLinkedin, FaInstagram, FaLink, FaExternalLinkAlt, FaLock } from "react-icons/fa";
import { emptyProfile as empty, profileValues, saveProfileChanges } from "../../services/profileEditor.js";
import Field from "../../components/ui/Field";
import Photo from "../../components/ui/Photo";
import TextArea from "../../components/TextArea/TextArea";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import Notice from "../../components/feedback/Notice";
import styles from "./EditProfile.module.css";

const steps = ["Identificação", "Apresentação e contatos", "Revisão"];
const stepDescriptions = ["Comece pelos dados que identificam você.", "Conte sobre sua trajetória e facilite novas conexões.", "Revise as informações antes de salvar."];
const previewHints = [
  ["Uma foto que represente você", "Uma imagem nítida ajuda a tornar seu perfil mais reconhecível na comunidade."],
  ["Sua trajetória em poucas palavras", "Uma apresentação breve conecta sua formação aos próximos capítulos da sua história."],
  ["Este é um resumo da sua apresentação.", "Confira ao lado se as informações estão corretas e, se necessário, volte às etapas anteriores para editar."]
];

function ProfilePhotoControl({ id, disabled, ...props }) {
  return <div className={styles.photoControl} data-disabled={disabled || undefined}>
    <label htmlFor={id} className={styles.choosePhoto}><FaUpload aria-hidden="true" />Escolher foto</label>
    <input {...props} id={id} disabled={disabled} className={styles.photoFile} aria-label="Escolher foto de perfil" />
  </div>;
}

function ProfileLinkControl({ icon, ...props }) {
  const Icon = icon;
  return <div className={styles.linkControl} data-invalid={props["aria-invalid"] || undefined} data-disabled={props.disabled || undefined}>
    <span className={styles.linkIcon}><Icon aria-hidden="true" /></span><input {...props} />
  </div>;
}

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
  const [partialError, setPartialError] = useState("");
  const errorNotice = useRef(null);
  const partialNotice = useRef(null);
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
  const canResetPassword = Boolean(id && auth.user?.role === "geral");
  const blocker = useUnsavedChanges(!loading && (JSON.stringify(egresso) !== JSON.stringify(original) || !!senha || !!confirmationPassword), saving || photoLoading);
  const exiting = useSessionExitGuard({ dirty: !loading && (JSON.stringify(egresso) !== JSON.stringify(original) || !!senha || !!confirmationPassword), pending: saving || photoLoading, release: blocker.release, retain: blocker.retain });
  const locked = saving || exiting;
  useEffect(() => {
    const controller = new AbortController();
    setStep(1); setError(""); setErrors({}); setLoadError(""); setPartialError("");
    setSenha(""); setConfirmationPassword(""); setPhotoError(""); setPhotoLoading(false); imageRevision.current += 1;
    if (!id) { setEgresso(empty); setOriginal(empty); setLoading(false); return; }
    setLoading(true);
    axios.get(API_URL + "/api/egressos/buscar/egresso/" + id, { signal: controller.signal })
      .then(({ data }) => { if (data?.id_egresso == null || String(data.id_egresso) !== String(id)) throw new Error("Este perfil não foi encontrado."); if (!controller.signal.aborted) { const values = profileValues(data); setEgresso(values); setOriginal(values); } })
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
  useEffect(() => { if (!saving) { if (error) errorNotice.current?.focus(); else if (partialError) partialNotice.current?.focus(); } }, [error, partialError, saving]);
  const change = event => { const { name, value } = event.target; setEgresso(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: "" })); };
  const upload = async event => {
    if (exiting || pending.current) return;
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
    if (pending.current || exiting || photoLoading || photoError) return;
    const all = profileErrors(egresso);
    if (!id || canResetPassword && senha) {
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
        const result = await saveProfileChanges({
          id, values: payload, password: senha, allowPasswordReset: canResetPassword,
          skipProfile: Boolean(partialError) && JSON.stringify(payload) === JSON.stringify(original),
          updateProfile: async (profileId, values) => (await axios.put(API_URL + "/api/egressos/atualizar/egresso/" + profileId, values)).data,
          resetPassword: (profileId, password) => axios.post(API_URL + "/api/gestao/egressos/" + profileId + "/senha", { senha: password }),
        });
        savedId = result.id;
        setOriginal(payload);
        if (result.passwordError) { setPartialError(errorMessage(result.passwordError)); return; }
      } else savedId = (await auth.register({ ...payload, senha })).id;
      if (savedId == null) throw new Error("O serviço não retornou a identificação do perfil salvo.");
      setSenha(""); setConfirmationPassword(""); setPartialError(""); setOriginal(egresso); blocker.release(); navigate("/egresso/" + savedId);
    } catch (error) { setError(errorMessage(error)); }
    finally { pending.current = false; setSaving(false); }
  };
  return (
    <Container className={styles.page}>
      <header className={styles.pageHeader}>
        <Breadcrumb items={id ? [{ label: canResetPassword ? "Perfil do egresso" : "Meu espaço", to: "/egresso/" + id }, { label: "Editar perfil" }] : [{ label: "Comunidade", to: "/egressos/listar" }, { label: "Cadastrar perfil" }]} />
        <h1>{id ? canResetPassword ? "Editar perfil do egresso" : "Editar meu perfil" : "Criar meu perfil"}</h1>
        <p>Sua história merece uma apresentação à altura.</p>
      </header>
      {loading ? <LoadingState label="Carregando perfil…" /> : loadError ? <ErrorState description={loadError} onRetry={() => setRevision(value => value + 1)} /> : <div className={styles.layout}>
        <aside className={styles.preview} aria-label="Prévia do perfil">
          <div className={styles.previewCard}>
            <p className={styles.previewEyebrow}>Prévia do perfil</p>
            <div className={styles.portraitPanel}><Photo src={egresso.foto} alt="" width={280} height={280} /></div>
            <h2>{egresso.nome || "Seu nome no portal"}</h2>
            <p className={styles.previewDescription}>{step === 1 ? "A foto é opcional. Seus dados poderão ser conferidos antes de salvar." : egresso.descricao?.trim() || "Uma apresentação para conectar sua formação aos próximos capítulos da sua história."}</p>
            {step === 3 && <div className={styles.previewNote}><strong>{previewHints[2][0]}</strong><p>{previewHints[2][1]}</p></div>}
          </div>
          {step < 3 && <div className={styles.previewTip}>{step === 1 ? <FaLightbulb aria-hidden="true" /> : <FaRegFileAlt aria-hidden="true" />}<div><strong>{previewHints[step - 1][0]}</strong><p>{previewHints[step - 1][1]}</p></div></div>}
        </aside>
        <form ref={form} className={styles.form} onSubmit={submit} noValidate aria-busy={locked || photoLoading}>
          <ol className={styles.steps} aria-label="Etapas do perfil">{steps.map((label, index) => <li key={label} data-complete={step > index + 1 || undefined} aria-current={step === index + 1 ? "step" : undefined}><span className={styles.stepNumber} aria-hidden="true">{step > index + 1 ? <FaCheck /> : index + 1}</span><span>{label}</span></li>)}</ol>
          <div className={styles.stepHeading}>
            <p className={styles.stepCount}>Etapa {step} de {steps.length} · {id ? "Edição do perfil" : "Cadastro de egresso"}</p>
            <h2 ref={heading} tabIndex={-1} className={styles.stepTitle}>{step === 3 ? "Confira seu perfil" : steps[step - 1]}</h2>
            {step < 3 && <p className={styles.stepDescription}>{stepDescriptions[step - 1]}</p>}
          </div>
          {error && <Notice variant="error" ref={errorNotice} tabIndex={-1} title="Não foi possível concluir"><p>{error}</p><p>Seus dados foram mantidos para você tentar novamente.</p></Notice>}
          {partialError && <Notice variant="warning" ref={partialNotice} tabIndex={-1} title="Perfil salvo; redefinição não confirmada"><p>A última atualização do perfil foi confirmada. Não foi possível confirmar a redefinição da senha: {partialError}</p><p>Você pode repetir a redefinição ou concluir com os dados já salvos.</p></Notice>}
          {step === 1 && <>
            <fieldset className={styles.photoGroup}><legend>Foto de perfil</legend><div className={styles.photoPicker}>
              <Photo src={egresso.foto} alt="" width={80} height={80} className={styles.photoThumbnail} />
              <Field as={ProfilePhotoControl} label="Foto de perfil" hideLabel name="fotoFile" type="file" accept={IMAGE_ACCEPT} onChange={upload} error={photoError} hint={photoLoading ? "Preparando imagem…" : IMAGE_HINT} disabled={locked || photoLoading} />
              <Button className={styles.removePhoto} variant="ghost" disabled={locked || photoLoading || !(egresso.foto || photoError)} onClick={() => { setEgresso(value => ({ ...value, foto: "" })); setPhotoError(""); const input = form.current?.querySelector('[name="fotoFile"]'); if (input) input.value = ""; }}>Usar sem foto</Button>
            </div></fieldset>
            <div className={styles.fields}>
              <Field label="Nome completo" name="nome" autoComplete="name" value={egresso.nome} onChange={change} error={errors.nome} required disabled={locked} />
              <Field label="E-mail" name="email" type="email" maxLength={254} autoComplete="email" value={egresso.email} onChange={change} error={errors.email} required disabled={locked} />
            </div>
            {(!id || canResetPassword) && <fieldset className={styles.group}><legend>Acesso à conta</legend><div className={styles.fields}>
              <Field label={id ? "Nova senha de acesso" : "Senha de acesso"} name="senha" type="password" autoComplete="new-password" value={senha} onChange={event => setSenha(event.target.value)} error={errors.senha} hint={id ? "Opcional. Define uma nova senha para este egresso." : "Use de 8 a 128 caracteres para acessar sua área."} maxLength={128} disabled={locked} required={!id} />
              <Field label="Confirmar senha" name="confirmationPassword" type="password" autoComplete="new-password" value={confirmationPassword} onChange={event => setConfirmationPassword(event.target.value)} error={errors.confirmationPassword} maxLength={128} disabled={locked} required={!id || !!senha} />
            </div></fieldset>}
          </>}
          {step === 2 && <>
            <Field as={TextArea} label="Sobre você" name="descricao" value={egresso.descricao} onChange={change} placeholder="Conte um pouco sobre sua formação, atuação e interesses." rows={6} hint="Uma apresentação breve da sua formação, atuação e interesses." disabled={locked} />
            <fieldset className={styles.group}><legend>Contatos e currículo</legend><p className={styles.groupHint}>Estes links são opcionais e aparecerão no perfil público.</p>
              <div className={styles.fields}>{[["linkedin", "LinkedIn", FaLinkedin], ["instagram", "Instagram", FaInstagram], ["curriculo", "Link do currículo", FaLink]].map(([name, label, icon]) => <Field key={name} as={ProfileLinkControl} icon={icon} className={name === "curriculo" ? styles.fullField : ""} label={label} name={name} type="url" value={egresso[name]} onChange={change} error={errors[name]} placeholder="https://" hint={name === "curriculo" ? "Compartilhe uma URL completa ou um caminho local iniciado com /." : "Endereço completo do perfil."} disabled={locked} />)}</div>
            </fieldset>
          </>}
          {step === 3 && <>
            <Notice className={styles.reviewNotice} title="Revise as informações antes de salvar." />
            <section className={styles.reviewSection} aria-labelledby="review-identification-title">
              <div className={styles.reviewHeading}><h3 id="review-identification-title">Identificação</h3><Button className={styles.editStep} variant="ghost" aria-label="Editar identificação" disabled={locked || photoLoading} onClick={() => setStep(1)}>Editar</Button></div>
              <dl className={styles.reviewGrid}>{[["nome", "Nome completo"], ["email", "E-mail"]].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{egresso[key] || "Não informado"}</dd></div>)}</dl>
            </section>
            <section className={styles.reviewSection} aria-labelledby="review-presentation-title">
              <div className={styles.reviewHeading}><h3 id="review-presentation-title">Apresentação</h3><Button className={styles.editStep} variant="ghost" aria-label="Editar apresentação" disabled={locked || photoLoading} onClick={() => setStep(2)}>Editar</Button></div>
              <dl className={styles.reviewGrid}><div className={styles.fullField}><dt>Sobre você</dt><dd>{egresso.descricao?.trim() || "Não informado"}</dd></div></dl>
            </section>
            <section className={styles.reviewSection} aria-labelledby="review-contacts-title">
              <div className={styles.reviewHeading}><h3 id="review-contacts-title">Contatos e currículo</h3><Button className={styles.editStep} variant="ghost" aria-label="Editar contatos" disabled={locked || photoLoading} onClick={() => setStep(2)}>Editar</Button></div>
              <dl className={styles.reviewGrid}>{[["linkedin", "LinkedIn"], ["instagram", "Instagram"], ["curriculo", "Currículo"]].map(([key, label]) => <div key={key} className={key === "curriculo" ? styles.fullField : ""}><dt>{label}</dt><dd>{egresso[key] ? profileErrors(egresso)[key] ? egresso[key] : <a href={egresso[key]} target="_blank" rel="noopener noreferrer">{egresso[key]}<FaExternalLinkAlt aria-hidden="true" /><span className={styles.srOnly}> (abre em nova aba)</span></a> : "Não informado"}</dd></div>)}</dl>
            </section>
          </>}
          {step === 3 && <p className={styles.passwordSummary}><FaLock aria-hidden="true" />{!id ? "Sua senha de acesso será definida no cadastro." : canResetPassword && senha ? "A redefinição da senha será enviada separadamente dos dados do perfil." : "A senha de acesso será mantida."}</p>}
          {partialError && JSON.stringify(egresso) === JSON.stringify(original) && <Button variant="secondary" disabled={locked || photoLoading} onClick={() => { setSenha(""); setConfirmationPassword(""); blocker.release(); navigate("/egresso/" + id); }}>Concluir com o perfil salvo</Button>}
          <footer className={styles.formFooter}>
            {step === 1 && <p className={styles.requiredHint}>Os campos com <span aria-hidden="true">*</span> são obrigatórios.</p>}
            <div className={styles.actions}>
              {step === 1 ? <Button variant="secondary" disabled={locked || photoLoading} onClick={() => navigate(id ? "/egresso/" + id : "/egressos/listar")}>Cancelar</Button> : <Button variant="secondary" disabled={locked || photoLoading} onClick={() => setStep(value => value - 1)}>Voltar</Button>}
              <div className={styles.submitAction}><Button className={step < 3 ? styles.nextStep : styles.confirmSave} type="submit" loading={saving} disabled={exiting || photoLoading || !!photoError} loadingLabel="Salvando perfil…">{step === 1 ? "Continuar" : step === 2 ? "Revisar dados" : partialError && JSON.stringify(egresso) === JSON.stringify(original) && senha ? "Tentar redefinir senha" : id ? "Salvar alterações" : "Cadastrar e entrar"}</Button>{step === 3 && <p className={styles.saveHint}>As alterações serão salvas ao confirmar.</p>}</div>
            </div>
          </footer>
        </form>
      </div>}
      <UnsavedChangesDialog blocker={blocker} pending={saving || photoLoading} />
    </Container>
  );
}
