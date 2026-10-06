import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../config/config.js";
import { errorMessage } from "../../utils/presentation";
import readImageFile from "../../utils/readImageFile";
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

export default function EditEgresso() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [egresso, setEgresso] = useState({ foto: "", nome: "", email: "", linkedin: "", instagram: "", curriculo: "", descricao: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true); setLoadError("");
    axios.get(API_URL + "/api/egressos/buscar/egresso/" + id, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setEgresso(data); })
      .catch(error => { if (!controller.signal.aborted) setLoadError(errorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, revision]);
  const change = event => { setEgresso(value => ({ ...value, [event.target.name]: event.target.value })); setConfirmed(false); };
  const upload = async event => {
    const file = event.target.files[0];
    if (!file) return;
    setPhotoLoading(true); setError("");
    try { const foto = await readImageFile(file); setEgresso(value => ({ ...value, foto })); setConfirmed(false); }
    catch (error) { setError(error.message); }
    finally { setPhotoLoading(false); }
  };
  const submit = async event => {
    event.preventDefault();
    if (!confirmed) { setConfirmed(true); return; }
    if (pending.current || photoLoading) return;
    pending.current = true; setSaving(true); setError("");
    try {
      const payload = Object.fromEntries(["nome", "email", "linkedin", "instagram", "curriculo", "foto", "descricao"].map(key => [key, egresso[key] || ""]));
      const response = id ? await axios.put(API_URL + "/api/egressos/atualizar/egresso/" + id, payload) : await axios.post(API_URL + "/api/egressos/salvar/egresso", payload);
      navigate("/egresso/" + response.data.id_egresso);
    } catch (error) { setError(errorMessage(error)); }
    finally { pending.current = false; setSaving(false); }
  };
  return (
    <PageShell eyebrow={id ? "Atualize sua trajetória" : "Faça parte da comunidade"} title={id ? "Seu perfil, sempre em movimento." : "Sua história merece um lugar aqui."}
      description="Apresente sua trajetória e seus contatos. Depois de salvar, você poderá registrar cursos, experiências e depoimentos."
      actions={<Link className={content.link} to={id ? "/egresso_view/" + id : "/egressos/listar"}>← Voltar</Link>}>
      {loading ? <LoadingState label="Carregando perfil…" /> : loadError ? <ErrorState description={loadError} onRetry={() => setRevision(value => value + 1)} /> : (
        <div className={styles.layout}>
          <aside className={styles.preview}><Photo src={egresso.foto} alt="" /><h2>{egresso.nome || "Seu perfil no portal"}</h2><p>Uma apresentação para conectar sua formação aos próximos capítulos da sua história.</p></aside>
          <form className={styles.form} onSubmit={submit} aria-busy={saving}>
            {error && <Notice variant="error"><p>{error}</p></Notice>}
            {confirmed && <Notice variant="info" title="Pronto para salvar?"><p>Revise os dados e confirme o cadastro abaixo. Alterações nos campos retornam à etapa de revisão.</p></Notice>}
            <fieldset className={styles.group} disabled={saving}>
              <legend>Identificação</legend>
              <Field label="Foto de perfil" type="file" accept="image/*" onChange={upload} hint={photoLoading ? "Preparando imagem…" : "Escolha uma imagem para personalizar seu perfil."} />
              <div className={styles.fields}>
                <Field label="Nome completo" name="nome" autoComplete="name" value={egresso.nome || ""} onChange={change} placeholder="Como você se chama?" required />
                <Field label="E-mail" name="email" type="email" autoComplete="email" value={egresso.email || ""} onChange={change} placeholder="voce@exemplo.com" required />
              </div>
            </fieldset>
            <fieldset className={styles.group} disabled={saving}>
              <legend>Contatos e apresentação</legend>
              <div className={styles.fields}>
                {[["linkedin", "LinkedIn"], ["instagram", "Instagram"], ["curriculo", "Link do currículo"]].map(([name, label]) => <Field key={name} label={label} name={name} type="url" value={egresso[name] || ""} onChange={change} placeholder="https://" />)}
              </div>
              <Field as={TextArea} label="Sobre você" name="descricao" value={egresso.descricao || ""} onChange={change} placeholder="Conte um pouco sobre sua formação, atuação e interesses." rows={5} />
            </fieldset>
            <div className={styles.actions}>
              {confirmed && <Button variant="secondary" disabled={saving} onClick={() => setConfirmed(false)}>Continuar editando</Button>}
              <Button type="submit" loading={saving} disabled={photoLoading} loadingLabel="Salvando perfil…">{confirmed ? "Salvar perfil" : "Revisar dados"}</Button>
            </div>
          </form>
        </div>
      )}
    </PageShell>
  );
}
