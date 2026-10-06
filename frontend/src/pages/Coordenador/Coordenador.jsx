import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import { formatDate } from "../../utils/presentation";
import readImageFile from "../../utils/readImageFile";
import useDashboard from "../../hooks/useDashboard";
import useMutation from "../../hooks/useMutation";
import AdminShell from "../../components/ui/AdminShell";
import Field from "../../components/ui/Field";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import TextArea from "../../components/TextArea/TextArea";
import Button from "../../components/Button/Button";
import PortalTable from "../../components/Table/PortalTable";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import Notice from "../../components/feedback/Notice";
import styles from "./Dashboard.module.css";

const empty = { titulo: "", noticia: "", feitoDestaque: "", imagem: "", imagemFile: null };
export default function Coordenador() {
  const { id } = useParams();
  const dashboard = useDashboard(id);
  const { busy, notice, run } = useMutation();
  const [selected, setSelected] = useState(null);
  const [highlight, setHighlight] = useState(empty);
  const [confirmation, setConfirmation] = useState(null);
  useEffect(() => {
    if (!selected) return;
    const heading = document.getElementById("create-highlight-title");
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView?.({ block: "start", behavior: "auto" });
  }, [selected]);
  const update = event => setHighlight(value => ({ ...value, [event.target.name]: event.target.value }));
  const select = egresso => { setSelected(egresso); setHighlight(empty); };
  const save = async event => {
    event.preventDefault();
    const saved = await run(async () => {
      const imagem = highlight.imagemFile ? await readImageFile(highlight.imagemFile) : highlight.imagem;
      await axios.post(API_URL + "/api/coordenadores/" + id + "/egresso/" + selected.id + "/destaque", {
        titulo: highlight.titulo, noticia: highlight.noticia, feitoDestaque: highlight.feitoDestaque, imagem,
      });
    }, "Destaque publicado com sucesso.", dashboard.reload);
    if (saved) setSelected(null);
  };
  const remove = async () => {
    if (await run(() => axios.delete(API_URL + confirmation.path), confirmation.success, dashboard.reload)) setConfirmation(null);
  };
  const columns = [
    { name: "Egresso", selector: row => row.nome, sortable: true, wrap: true, cell: row => <Link className={styles.link} to={"/egresso_view/" + row.id}>{row.nome}</Link> },
    { name: "E-mail", selector: row => row.email, wrap: true },
    { name: "Ingresso", selector: row => row.anoInicio, sortable: true },
    { name: "Conclusão", selector: row => row.anoFim || "Em andamento", sortable: true },
    { name: "Ações", cell: row => <div className={styles.actions}>
      <Button variant="secondary" disabled={busy} onClick={() => select(row)}>Criar destaque</Button>
      <Button variant="ghost" disabled={busy} onClick={() => setConfirmation({ path: "/api/egressos/deletar/egresso/" + row.id, description: "O perfil de " + row.nome + " será excluído. Esta ação não pode ser desfeita.", success: "Egresso excluído com sucesso." })}>Excluir</Button>
    </div> },
  ];
  const uniqueGraduates = new Set(dashboard.cursos.flatMap(course => course.egressos?.map(item => String(item.id)) || []));
  const graduatesIncomplete = dashboard.sections.cursos || dashboard.cursos.some(course => course.egressosError);
  return (
    <AdminShell title="Acompanhe sua comunidade." description="Organize seus cursos, conheça os egressos e publique as conquistas que merecem destaque."
      login={dashboard.coordenador?.login} sections={[["courses", "Meus cursos"], ["graduates", "Egressos"], ["highlights", "Meus destaques"]]}
      stats={!dashboard.loading && !dashboard.error ? [["Cursos vinculados", dashboard.sections.cursos ? "Indisponível" : dashboard.cursos.length], ["Egressos nos cursos", graduatesIncomplete ? "Indisponível" : uniqueGraduates.size], ["Destaques publicados", dashboard.sections.destaques ? "Indisponível" : dashboard.destaques.length]] : undefined}>
      {notice && <Notice className={styles.notice} variant={notice.variant}><p>{notice.text}</p></Notice>}
      {dashboard.loading ? <LoadingState label="Carregando painel…" /> : dashboard.error ? <ErrorState description={dashboard.error} onRetry={dashboard.reload} /> : (
        <div className={styles.sections}>
          <section id="courses" className={styles.panel}><h2>Meus cursos</h2>
            {dashboard.sections.cursos ? <ErrorState description={dashboard.sections.cursos} onRetry={dashboard.reload} /> : dashboard.cursos.length ? <div className={styles.table}><PortalTable keyField="id_curso" columns={[{ name: "Curso", selector: row => row.nome, sortable: true, wrap: true }, { name: "Nível", selector: row => row.nivel, sortable: true }]} data={dashboard.cursos} /></div> : <p className={styles.empty}>Ainda não há cursos vinculados a esta conta. Solicite à coordenação geral o cadastro de um curso sob sua responsabilidade.</p>}
          </section>
          <section id="graduates" className={styles.panel}><h2>Egressos por curso</h2>
            {dashboard.sections.cursos ? <ErrorState description="Os cursos precisam estar disponíveis para consultar seus egressos." onRetry={dashboard.reload} /> : dashboard.cursos.length ? dashboard.cursos.map(course => <div key={course.id_curso} className={styles.subsection}><h3>{course.nome}</h3>{course.egressosError ? <ErrorState description={course.egressosError} onRetry={dashboard.reload} /> : course.egressos.length ? <div className={styles.table}><PortalTable columns={columns} data={course.egressos} keyField="id" /></div> : <p className={styles.empty}>Este curso ainda não tem egressos vinculados. O vínculo é criado ao adicionar uma formação ao perfil do egresso.</p>}</div>) : <p className={styles.empty}>Os egressos aparecerão aqui quando estiverem vinculados aos seus cursos.</p>}
          </section>
          {selected && <section className={styles.panel} aria-labelledby="create-highlight-title">
            <h2 id="create-highlight-title" tabIndex={-1}>Novo destaque: {selected.nome}</h2>
            <form className={styles.form} onSubmit={save} aria-busy={busy}>
              <Field label="Título" name="titulo" value={highlight.titulo} onChange={update} required disabled={busy} />
              <Field as={TextArea} label="Notícia" name="noticia" value={highlight.noticia} onChange={update} rows={5} required disabled={busy} />
              <Field label="Conquista em destaque" name="feitoDestaque" value={highlight.feitoDestaque} onChange={update} required disabled={busy} />
              <div className={styles.columns}>
                <Field type="file" label="Imagem do destaque" accept="image/*" onChange={event => setHighlight(value => ({ ...value, imagemFile: event.target.files[0] || null }))} disabled={busy} hint="O arquivo escolhido tem prioridade sobre a URL." />
                <Field label="Ou use uma URL de imagem" name="imagem" type="url" value={highlight.imagem} onChange={update} disabled={busy || !!highlight.imagemFile} placeholder="https://" />
              </div>
              <div className={styles.actions}><Button type="submit" loading={busy} loadingLabel="Publicando…">Publicar destaque</Button><Button variant="secondary" disabled={busy} onClick={() => setSelected(null)}>Cancelar</Button></div>
            </form>
          </section>}
          <section id="highlights" className={styles.panel}><h2>Meus destaques</h2>
            {dashboard.sections.destaques ? <ErrorState description={dashboard.sections.destaques} onRetry={dashboard.reload} /> : dashboard.destaques.length ? <div className={styles.records}>{dashboard.destaques.map(item => <article key={item.id} className={styles.record}>
              <p>{formatDate(item.dataPublicacao)}</p><h3>{item.titulo}</h3><p>{item.noticia}</p><p><strong>Conquista:</strong> {item.feitoDestaque}</p>
              <div className={styles.actions}><Link className={styles.link} to={"/destaques/" + item.id}>Ver publicação →</Link><Button variant="ghost" disabled={busy} onClick={() => setConfirmation({ path: "/api/coordenadores/deletar/destaque/" + item.id, description: "O destaque “" + item.titulo + "” será removido do portal.", success: "Destaque excluído com sucesso." })}>Excluir</Button></div>
            </article>)}</div> : <p className={styles.empty}>Selecione um egresso na tabela acima para publicar seu primeiro destaque.</p>}
          </section>
        </div>
      )}
      <ConfirmDialog open={!!confirmation} error={notice?.variant === "error" ? notice.text : undefined} description={confirmation?.description} pending={busy} onCancel={() => setConfirmation(null)} onConfirm={remove} />
    </AdminShell>
  );
}
