import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import { formatDate } from "../../utils/presentation";
import { graduateRows, matchesSearch } from "../../utils/management.js";
import useDashboard from "../../hooks/useDashboard";
import useMutation from "../../hooks/useMutation";
import AdminShell from "../../components/ui/AdminShell";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import HighlightComposer from "../../components/ui/HighlightComposer";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/Button/Button";
import PortalTable from "../../components/Table/PortalTable";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import Notice from "../../components/feedback/Notice";
import styles from "./Dashboard.module.css";

export default function Coordenador() {
  const { id } = useParams();
  const dashboard = useDashboard(id);
  const { busy, notice, run } = useMutation();
  const [selected, setSelected] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [highlightQuery, setHighlightQuery] = useState("");
  const rows = graduateRows(dashboard.cursos, { query, courseId });
  const courses = dashboard.cursos.filter(course => matchesSearch(courseQuery, course.nome, course.nivel));
  const highlights = dashboard.destaques.filter(item => matchesSearch(highlightQuery, item.titulo, item.egresso?.nome, item.feitoDestaque));
  const failedCourses = dashboard.cursos.filter(course => course.egressosError && (!courseId || String(course.id_curso) === courseId));
  const publish = payload => run(() => axios.post(API_URL + "/api/coordenadores/" + id + "/egresso/" + selected.id + "/destaque", payload), "Destaque publicado com sucesso.", dashboard.reload);
  const remove = async () => {
    if (await run(() => axios.delete(API_URL + confirmation.path), confirmation.success, dashboard.reload)) setConfirmation(null);
  };
  const columns = [
    { name: "Egresso", selector: row => row.nome, sortable: true, wrap: true, cell: row => <Link className={styles.link} to={"/egresso_view/" + row.id}>{row.nome}</Link> },
    { name: "Curso", selector: row => row.courseName, sortable: true, wrap: true },
    { name: "E-mail", selector: row => row.email, wrap: true },
    { name: "Período", selector: row => `${row.anoInicio ?? "Não informado"} – ${row.anoFim ?? "Em andamento"}`, wrap: true },
    { name: "Ações", cell: row => <div className={styles.actions}>
      <Button variant="secondary" disabled={busy || !!selected} onClick={() => setSelected(row)}>Criar destaque</Button>
      <Button variant="ghost" disabled={busy || !!selected || row.idVinculo == null} onClick={() => setConfirmation({ path: "/api/egressos/deletar/curso_egresso/" + row.idVinculo, title: "Desvincular formação?", label: "Desvincular formação", description: `A formação de ${row.nome} no curso ${row.courseName} será removida. O perfil, as outras formações e as experiências serão preservados.`, success: "Formação desvinculada com sucesso." })}>Desvincular formação</Button>
    </div> },
  ];
  const uniqueGraduates = new Set(dashboard.cursos.flatMap(course => course.egressos?.map(item => String(item.id)) || []));
  const graduatesIncomplete = dashboard.sections.cursos || dashboard.cursos.some(course => course.egressosError);
  return (
    <AdminShell title="Acompanhe sua comunidade." description="Organize seus cursos, conheça os egressos e publique as conquistas que merecem destaque."
      login={dashboard.coordenador?.login} sections={[["courses", "Meus cursos"], ["graduates", "Egressos"], ["highlights", "Meus destaques"]]}
      stats={!dashboard.loading && !dashboard.error ? [["Cursos vinculados", dashboard.sections.cursos ? "Indisponível" : dashboard.cursos.length], ["Egressos nos cursos", graduatesIncomplete ? "Indisponível" : uniqueGraduates.size], ["Destaques publicados", dashboard.sections.destaques ? "Indisponível" : dashboard.destaques.length]] : undefined}>
      {notice && <Notice className={styles.notice} variant={notice.variant}><p>{notice.text}</p></Notice>}
      {dashboard.loading ? <LoadingState label="Carregando painel…" /> : dashboard.error ? <ErrorState description={dashboard.error} onRetry={dashboard.reload} /> : <div className={styles.sections}>
        <section id="courses" className={styles.panel}><h2>Meus cursos</h2>
          {dashboard.sections.cursos ? <ErrorState description={dashboard.sections.cursos} onRetry={dashboard.reload} /> : dashboard.cursos.length ? <>
            <Field label="Buscar nos meus cursos" name="buscaCursos" value={courseQuery} onChange={event => setCourseQuery(event.target.value)} placeholder="Nome ou nível" />
            <p className={styles.count} role="status">{courses.length} de {dashboard.cursos.length} cursos</p>
            <div className={styles.table}><PortalTable key={courseQuery} keyField="id_curso" columns={[{ name: "Curso", selector: row => row.nome, sortable: true, wrap: true }, { name: "Nível", selector: row => row.nivel, sortable: true }, { name: "Vínculos", selector: row => row.egressosError ? "Indisponível" : row.egressos.length }]} data={courses} paginationResetDefaultPage={!!courseQuery} /></div>
          </> : <p className={styles.empty}>Ainda não há cursos vinculados a esta conta. Solicite à coordenação geral o cadastro de um curso sob sua responsabilidade.</p>}
        </section>
        <section id="graduates" className={styles.panel}><h2>Egressos por curso</h2>
          {dashboard.sections.cursos ? <ErrorState description="Os cursos precisam estar disponíveis para consultar seus egressos." onRetry={dashboard.reload} /> : dashboard.cursos.length ? <>
            <div className={styles.filters}><Field label="Buscar egressos" name="buscaEgressos" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome ou e-mail" /><Field as={Select} label="Filtrar por curso" name="curso" value={courseId} onChange={event => setCourseId(event.target.value)}><option value="">Todos os meus cursos</option>{dashboard.cursos.map(course => <option key={course.id_curso} value={course.id_curso}>{course.nome}</option>)}</Field><Button variant="secondary" onClick={() => { setQuery(""); setCourseId(""); }}>Limpar pesquisa</Button></div>
            {failedCourses.map(course => <ErrorState key={course.id_curso} title={"Egressos indisponíveis: " + course.nome} description={course.egressosError} onRetry={dashboard.reload} />)}
            <p className={styles.count} role="status">{rows.length} vínculos carregados nesta consulta{failedCourses.length ? "; há cursos indisponíveis" : ""}.</p>
            <div className={styles.table}><PortalTable key={query + ":" + courseId} columns={columns} data={rows} keyField="rowKey" paginationResetDefaultPage={!!query || !!courseId} /></div>
          </> : <p className={styles.empty}>Os egressos aparecerão aqui quando estiverem vinculados aos seus cursos.</p>}
        </section>
        <section id="highlights" className={styles.panel}><h2>Meus destaques</h2>
          {dashboard.sections.destaques ? <ErrorState description={dashboard.sections.destaques} onRetry={dashboard.reload} /> : dashboard.destaques.length ? <>
            <Field label="Buscar nos meus destaques" name="buscaDestaques" value={highlightQuery} onChange={event => setHighlightQuery(event.target.value)} placeholder="Título, egresso ou conquista" />
            <p className={styles.count} role="status">{highlights.length} de {dashboard.destaques.length} destaques</p>
            {highlights.length ? <div className={styles.records}>{highlights.map(item => <article key={item.id} className={styles.record}><p>{formatDate(item.dataPublicacao)} · {item.egresso?.nome}</p><h3>{item.titulo}</h3><p><strong>Conquista:</strong> {item.feitoDestaque}</p><details><summary>Ler notícia</summary><p>{item.noticia}</p></details><div className={styles.actions}><Link className={styles.link} to={"/destaques/" + item.id}>Ver publicação →</Link><Button variant="ghost" disabled={busy || !!selected} onClick={() => setConfirmation({ path: "/api/coordenadores/deletar/destaque/" + item.id, description: `O destaque “${item.titulo}” será removido da galeria e do perfil do egresso.`, success: "Destaque excluído com sucesso." })}>Excluir destaque</Button></div></article>)}</div> : <p className={styles.empty}>Nenhum destaque corresponde à pesquisa. Ajuste os termos para ampliar a busca.</p>}
          </> : <p className={styles.empty}>Selecione um egresso na consulta acima para publicar seu primeiro destaque.</p>}
        </section>
      </div>}
      {selected && <div className={styles.composer}><HighlightComposer egresso={selected} busy={busy} onPublish={publish} onClose={() => setSelected(null)} /></div>}
      <ConfirmDialog open={!!confirmation} title={confirmation?.title} confirmLabel={confirmation?.label} error={notice?.variant === "error" ? notice.text : undefined} description={confirmation?.description} pending={busy} onCancel={() => setConfirmation(null)} onConfirm={remove} />
    </AdminShell>
  );
}
