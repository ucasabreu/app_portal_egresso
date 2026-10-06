import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { API_URL } from "../../config/config.js";
import LogoImg from "../../assets/ufmalogo.png";
import Button from "../../components/Button/Button.jsx";
import Container from "../../components/ui/Container";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import Notice from "../../components/feedback/Notice";
import styles from "./Login.module.css";

const LoginCoordenador = () => {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("coordenador");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCadastro, setIsCadastro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const pendingRef = useRef(false);
  const requestRef = useRef(null);
  const errorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => () => requestRef.current?.abort(), []);

  const handleAuth = async (event) => {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    requestRef.current = new AbortController();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (isCadastro) {
        await axios.post(API_URL + "/api/coordenadores/salvar/coordenador", {
          login,
          senha,
          tipo,
        }, { signal: requestRef.current.signal });
        setIsCadastro(false);
        setSenha("");
        setShowPassword(false);
        setSuccess("Conta criada com sucesso. Entre com seu login e senha.");
      } else {
        const response = await axios.get(API_URL + "/api/coordenadores/buscar/coordenador", {
          params: { login, senha },
          signal: requestRef.current.signal,
        });
        const { id_coordenador: idCoordenador, tipo: tipoCoordenador } = response.data;
        navigate(tipoCoordenador === "geral"
          ? "/coordenador_geral/" + idCoordenador
          : "/coordenador/" + idCoordenador);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      const data = err.response?.data;
      if (typeof data === "string" && data) {
        setError(data);
      } else if (data?.message && typeof data.message === "string") {
        setError(data.message);
      } else if (data && typeof data === "object") {
        const messages = Object.values(data).filter(value => typeof value === "string");
        setError(messages.join(" ") || "Não foi possível concluir a solicitação. Tente novamente.");
      } else {
        setError("Não foi possível acessar o serviço. Tente novamente em alguns instantes.");
      }
    } finally {
      pendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsCadastro(value => !value);
    setError("");
    setSuccess("");
    setSenha("");
    setShowPassword(false);
  };

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <Container className={styles.container}>
        <Link to="/" className={styles.back}>
          <FaArrowLeft aria-hidden="true" /> Voltar ao portal
        </Link>
        <div className={styles.layout}>
          <section className={styles.story} aria-labelledby="portal-story-title">
            <Link to="/" className={styles.brand} aria-label="Portal de Egressos — início">
              <span className={styles.logo}><img src={LogoImg} alt="UFMA" width={1080} height={1080} decoding="async" /></span>
              <span>Portal de Egressos<small>Comunidade acadêmica</small></span>
            </Link>
            <div className={styles.storyContent}>
              <p className={styles.eyebrow}>Vínculos que continuam</p>
              <p id="portal-story-title" className={styles.storyTitle}>A graduação é só o começo.</p>
              <p className={styles.storyDescription}>
                Cada trajetória faz parte da nossa história. Conecte formação,
                experiências e conquistas da comunidade de egressos.
              </p>
              <ul className={styles.features}>
                <li><span aria-hidden="true">01</span>Trajetórias acadêmicas e profissionais</li>
                <li><span aria-hidden="true">02</span>Depoimentos e histórias da comunidade</li>
                <li><span aria-hidden="true">03</span>Gestão de cursos, egressos e destaques</li>
              </ul>
            </div>
            <p className={styles.storyFooter}>Formação que conecta. Histórias que inspiram.</p>
          </section>

          <section className={styles.access} aria-labelledby="login-title">
            <header className={styles.intro}>
              <p className={styles.accessEyebrow}>Área da coordenação</p>
              <h1 id="login-title" className={styles.title}>
                {isCadastro ? "Crie sua conta" : "Bem-vindo de volta"}
              </h1>
              <p className={styles.description}>
                {isCadastro
                  ? "Preencha os dados para cadastrar uma conta de coordenação."
                  : "Entre para acompanhar a comunidade e organizar as informações do portal."}
              </p>
            </header>

            <form className={styles.form} onSubmit={handleAuth} aria-busy={isSubmitting}>
              {error && (
                <Notice variant="error" title="Não foi possível continuar" ref={errorRef} tabIndex={-1}>
                  <p>{error}</p>
                </Notice>
              )}
              {success && <Notice variant="success"><p>{success}</p></Notice>}
              <Field
                id="coordenador-login"
                label="Login"
                name="login"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={login}
                onChange={event => setLogin(event.target.value)}
                placeholder="Seu login de coordenador"
                hint={isCadastro ? "Use de 4 a 20 caracteres: letras, números, pontos ou underline." : undefined}
                minLength={isCadastro ? 4 : undefined}
                maxLength={isCadastro ? 20 : undefined}
                pattern={isCadastro ? "[a-zA-Z0-9._]+" : undefined}
                disabled={isSubmitting}
                required
              />
              <Field
                id="coordenador-senha"
                label="Senha"
                name="senha"
                type={showPassword ? "text" : "password"}
                autoComplete={isCadastro ? "new-password" : "current-password"}
                value={senha}
                onChange={event => setSenha(event.target.value)}
                placeholder="Digite sua senha"
                disabled={isSubmitting}
                required
                labelAction={
                  <Button
                    variant="ghost"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(value => !value)}
                    aria-controls="coordenador-senha"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                    {showPassword ? "Ocultar senha" : "Mostrar senha"}
                  </Button>
                }
              />
              {isCadastro && (
                <Field
                  as={Select}
                  id="coordenador-tipo"
                  label="Tipo de coordenação"
                  name="tipo"
                  value={tipo}
                  onChange={event => setTipo(event.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="coordenador">Coordenador de curso</option>
                  <option value="geral">Coordenador geral</option>
                </Field>
              )}
              <Button
                type="submit"
                className={styles.submit}
                loading={isSubmitting}
                loadingLabel={isCadastro ? "Criando conta…" : "Entrando…"}
              >
                {isCadastro ? "Criar conta" : "Entrar no portal"}
                <FaArrowRight aria-hidden="true" />
              </Button>
            </form>

            <div className={styles.switchMode}>
              <p>{isCadastro ? "Já possui uma conta?" : "Ainda não possui uma conta?"}</p>
              <Button variant="ghost" onClick={toggleMode} disabled={isSubmitting}>
                {isCadastro ? "Entrar com minha conta" : "Cadastrar conta de coordenação"}
              </Button>
            </div>
          </section>
        </div>
        <p className={styles.footer}>Portal de Egressos · Formação, comunidade e trajetória</p>
      </Container>
    </main>
  );
};

export default LoginCoordenador;
