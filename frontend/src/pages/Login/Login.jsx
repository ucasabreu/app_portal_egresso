import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth, loginDestination } from "../../auth/AuthContext.js";
import { errorMessage } from "../../utils/presentation.js";
import { focusFirstError } from "../../utils/management.js";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import LogoImg from "../../assets/ufmalogo.png";
import Button from "../../components/Button/Button.jsx";
import Container from "../../components/ui/Container";
import Field from "../../components/ui/Field";
import Notice from "../../components/feedback/Notice";
import styles from "./Login.module.css";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const form = useRef(null);
  const focusError = useRef(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const errorRef = useRef(null);
  const pending = useRef(false);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => { const active = Object.fromEntries(Object.entries(fieldErrors).filter(([, message]) => message)); if (focusError.current && Object.keys(active).length) { focusError.current = false; focusFirstError(form.current, active); } }, [fieldErrors]);
  const submit = async event => {
    event.preventDefault();
    if (pending.current || auth.loading) return;
    const errors = {};
    if (!login.trim()) errors.login = "Informe seu login ou e-mail.";
    if (!senha.trim()) errors.senha = "Informe sua senha.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) { focusError.current = true; return; }
    pending.current = true; setBusy(true); setError("");
    try {
      const user = await auth.login({ login: login.trim(), senha });
      setSenha("");
      navigate(loginDestination(user, location.state?.returnTo), { replace: true });
    } catch (error) { setError(errorMessage(error)); }
    finally { pending.current = false; setBusy(false); }
  };
  if (!auth.loading && auth.user) return <Navigate to={loginDestination(auth.user, location.state?.returnTo)} replace />;
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <Container className={styles.container}>
        <Link to="/" className={styles.back}><FaArrowLeft aria-hidden="true" /> Voltar ao portal</Link>
        <div className={styles.layout}>
          <section className={styles.story} aria-labelledby="portal-story-title">
            <Link to="/" className={styles.brand}><span className={styles.logo}><img src={LogoImg} alt="UFMA" width={1080} height={1080} decoding="async" /></span><span>Portal de Egressos<small>Comunidade acadêmica</small></span></Link>
            <div className={styles.storyContent}>
              <p className={styles.eyebrow}>Vínculos que continuam</p><h2 id="portal-story-title" className={styles.storyTitle}>Sua trajetória continua conectada.</h2><p className={styles.storyDescription}>Atualize seu perfil, compartilhe experiências e acompanhe as conquistas da comunidade.</p>
              <ul className={styles.features}><li><span aria-hidden="true">01</span>Perfis e trajetórias dos egressos</li><li><span aria-hidden="true">02</span>Conquistas e experiências compartilhadas</li><li><span aria-hidden="true">03</span>Gestão de cursos e publicações</li></ul>
            </div>
          </section>
          <section className={styles.access} aria-labelledby="login-title">
            <header className={styles.intro}><p className={styles.accessEyebrow}>Acesso ao portal</p><h1 id="login-title" className={styles.title}>Bem-vindo de volta</h1><p className={styles.description}>Use seu e-mail de egresso ou login de coordenação para acessar sua área.</p></header>
            {auth.loading ? <LoadingState label="Verificando sua sessão…" /> : auth.error ? <ErrorState description={auth.error} onRetry={auth.refresh} /> : <form ref={form} className={styles.form} onSubmit={submit} noValidate aria-busy={busy}>
              {error && <Notice variant="error" ref={errorRef} tabIndex={-1}><p>{error}</p></Notice>}
              <Field label="Login ou e-mail" name="login" autoComplete="username" autoCapitalize="none" spellCheck={false} value={login} error={fieldErrors.login} onChange={event => { setLogin(event.target.value); setFieldErrors(value => ({ ...value, login: "" })); }} placeholder="Seu login ou e-mail" maxLength={254} disabled={busy} required />
              <Field id="portal-password" label="Senha" name="senha" type={showPassword ? "text" : "password"} autoComplete="current-password" value={senha} error={fieldErrors.senha} onChange={event => { setSenha(event.target.value); setFieldErrors(value => ({ ...value, senha: "" })); }} maxLength={128} disabled={busy} required
                labelAction={<Button variant="ghost" className={styles.passwordToggle} onClick={() => setShowPassword(value => !value)} aria-controls="portal-password" aria-pressed={showPassword} disabled={busy}>{showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}{showPassword ? "Ocultar senha" : "Mostrar senha"}</Button>} />
              <Button type="submit" className={styles.submit} loading={busy} loadingLabel="Entrando…">Entrar no portal <FaArrowRight aria-hidden="true" /></Button>
            </form>}
            <div className={styles.switchMode}><p>Ainda não possui um perfil?</p><Link to="/edit-egresso">Cadastrar meu perfil de egresso</Link><p>Contas de coordenação são cadastradas pela coordenação geral.</p></div>
          </section>
        </div>
        <p className={styles.footer}>Portal de Egressos · Formação, comunidade e trajetória</p>
      </Container>
    </main>
  );
}
