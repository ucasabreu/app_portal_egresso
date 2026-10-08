import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import { graduateRows, matchesSearch, graduateSummary, draftResponse } from "../../utils/management.js";
import useCollection from "../../hooks/useCollection";
import useDashboard from "../../hooks/useDashboard";
import useMutation from "../../hooks/useMutation";
import AdminShell from "../../components/ui/AdminShell";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import FilterTabs from "../../components/ui/FilterTabs";
import PublicationSuccessDialog from "../../components/ui/PublicationSuccessDialog";
import ManagementRecord from "../../components/ui/ManagementRecord";
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
  const drafts = useCollection("/api/gestao/rascunhos");
  const { busy, notice, run, error: mutationError, clearNotice } = useMutation();
  const [editorState, setEditorState] = useState({ dirty: false, pending: false });
  const [publicationTab, setPublicationTab] = useState("all");
  const [chooseGraduate, setChooseGraduate] = useState(false);
  const [graduateId, setGraduateId] = useState("");
  const [publicationResult, setPublicationResult] = useState(null);
  useEffect(() => { if (chooseGraduate) document.getElementById("publication-egresso")?.focus(); }, [chooseGraduate]);
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
  const saved = () => { dashboard.reload(); drafts.retry(); };
  const publish = async (payload, draft) => {
    let result;
    const editing = !!selected.publication;
    const confirmed = await run(async () => { result = (await (editing
      ? axios.put(API_URL + "/api/coordenadores/atualizar/destaque/" + selected.publication.id, payload)
      : draft ? axios.post(API_URL + "/api/gestao/rascunhos/" + draft.id + "/publicar", { versao: draft.versao })
        : axios.post(API_URL + "/api/coordenadores/" + id + "/egresso/" + selected.id + "/destaque", payload))).data; },
    editing ? "Destaque atualizado com sucesso." : "Destaque publicado com sucesso.", saved);
    if (confirmed) setPublicationResult({ id: editing ? selected.publication.id : result?.id, editing });
    return confirmed;
  };
  const saveDraft = async (values, draft) => {
    let result;
    const payload = { ...values, id_egresso: selected.id, versao: draft?.versao };
    if (await run(async () => { result = draftResponse((await (draft ? axios.put(API_URL + "/api/gestao/rascunhos/" + draft.id, payload) : axios.post(API_URL + "/api/gestao/rascunhos", payload))).data, draft?.id); }, "Rascunho salvo no banco.", drafts.retry)) return result;
    return false;
  };
  const reloadDraft = async draftId => {
    let result;
    if (await run(async () => { result = draftResponse((await axios.get(API_URL + "/api/gestao/rascunhos/" + draftId)).data, draftId); }, "Versão atual do rascunho carregada.", drafts.retry)) return result;
    return false;
  };
  const openEditor = selection => { clearNotice(); setChooseGraduate(false); setSelected(selection); };
  const remove = async () => {
    if (!confirmation || busy) return;
    if (await run(() => axios.delete(API_URL + confirmation.path), confirmation.success, saved)) setConfirmation(null);
  };
  const columns = [
    { name: "Egresso", selector: row => row.nome, sortable: true, wrap: true, cell: row => <Link className={styles.link} to={"/egresso_view/" + row.id}>{row.nome}</Link> },
    { name: "Curso", selector: row => row.courseName, sortable: true, wrap: true },
    { name: "E-mail", selector: row => row.email, wrap: true },
    { name: "Período", selector: row => `${row.anoInicio ?? "Não informado"} – ${row.anoFim ?? "Em andamento"}`, wrap: true },
    { name: "Ações", cell: row => <div className={styles.actions}>
      <Button variant="secondary" disabled={busy || !!selected} onClick={() => openEditor(row)}>Criar destaque</Button>
      <Button variant="ghost" disabled={busy || !!selected || row.idVinculo == null} onClick={() => setConfirmation({ path: "/api/egressos/deletar/curso_egresso/" + row.idVinculo, title: "Desvincular formação?", label: "Desvincular formação", description: `A formação de ${row.nome} no curso ${row.courseName} será removida. O perfil, as outras formações e as experiências serão preservados.`, success: "Formação desvinculada com sucesso." })}>Desvincular formação</Button>
    </div> },
  ];
  const summary = graduateSummary(dashboard.cursos, dashboard.sections.cursos);
  const draftItems = drafts.data.filter(item => matchesSearch(highlightQuery, item.titulo, item.egresso?.nome, item.feitoDestaque));
  const people = [...new Map(rows.map(row => [String(row.id), row])).values()];
  const publicationCount = dashboard.sections.destaques ? "—" : dashboard.destaques.length;
  const draftCount = drafts.loading || drafts.error ? "—" : drafts.data.length;
  return (
    <AdminShell title={dashboard.coordenador?.login ? `Olá, ${dashboard.coordenador.login}!` : "Painel da coordenação"} description="Organize seus cursos, conheça os egressos e publique as conquistas que merecem destaque."
      dirty={editorState.dirty} pending={busy || editorState.pending} onExitConfirmed={editorState.release} onExitFailed={editorState.retain}
      onSectionChange={section => { if (section === "drafts") setPublicationTab("drafts"); else if (section === "highlights") setPublicationTab("all"); }}
      login={dashboard.coordenador?.login} sections={[["dashboard-summary", "Painel"], ["graduates", "Egressos"], ["highlights", "Publicações"], ["courses", "Meus cursos"]]}
      stats={!dashboard.loading && !dashboard.error ? [["Cursos vinculados", dashboard.sections.cursos ? "Indisponível" : dashboard.cursos.length], ["Egressos únicos", summary.people, typeof summary.associations === "number" ? `${summary.associations} vínculos de formação` : "Vínculos de formação indisponíveis"], ["Destaques publicados", dashboard.sections.destaques ? "Indisponível" : dashboard.destaques.length], ["Rascunhos privados", drafts.loading || drafts.error ? "Indisponível" : drafts.data.length]] : undefined}>
      {notice && <Notice className={styles.notice} variant={notice.variant}><p>{notice.text}</p></Notice>}
      {dashboard.loading ? <LoadingState label="Carregando painel…" /> : dashboard.error ? <ErrorState description={dashboard.error} onRetry={dashboard.reload} /> : <div className={styles.sections}>
        <section id="highlights" className={styles.panel}>
          <div className={styles.sectionHeading}><h2>Destaques e publicações</h2><Button disabled={busy || !!selected || !!dashboard.sections.cursos || !people.length} aria-expanded={chooseGraduate} aria-controls="publication-picker" onClick={() => setChooseGraduate(value => !value)}><FaPlus aria-hidden="true" /> Novo destaque</Button></div>
          {chooseGraduate && <div id="publication-picker" className={styles.publicationPicker}><Field id="publication-egresso" as={Select} label="Escolha um egresso dos seus cursos" value={graduateId} onChange={event => setGraduateId(event.target.value)}><option value="">Selecione uma pessoa</option>{people.map(person => <option key={person.id} value={person.id}>{person.nome}</option>)}</Field><Button disabled={!graduateId || busy} onClick={() => { const person = people.find(item => String(item.id) === graduateId); if (person) openEditor(person); }}>Continuar <FaArrowRight aria-hidden="true" /></Button><Button variant="ghost" onClick={() => setChooseGraduate(false)}>Cancelar</Button></div>}
          {!people.length && !selected && <p className={styles.sectionDescription}>Para criar um destaque, é preciso carregar um egresso vinculado aos seus cursos.</p>}
          <FilterTabs id="publication-tabs" label="Filtrar publicações" panelId="publication-results" value={publicationTab} onChange={setPublicationTab} items={[{ value: "all", label: "Todas", count: typeof publicationCount === "number" && typeof draftCount === "number" ? publicationCount + draftCount : "—" }, { value: "published", label: "Publicadas", count: publicationCount }, { value: "drafts", label: "Rascunhos", count: draftCount }]} />
          <div className={styles.publicationSearch}><Field type="search" label="Buscar publicações e rascunhos" name="buscaPublicacoes" value={highlightQuery} onChange={event => setHighlightQuery(event.target.value)} placeholder="Título, egresso ou conquista" /></div>
          <div id="publication-results" role="tabpanel" aria-labelledby={"publication-tabs-" + publicationTab} tabIndex={0}>
            {publicationTab !== "drafts" && <div className={styles.recordGroup}><h3 className={styles.groupTitle}>Publicações</h3>
              {dashboard.sections.destaques ? <ErrorState description={dashboard.sections.destaques} onRetry={dashboard.reload} /> : highlights.length ? highlights.map(item => <ManagementRecord key={item.id} item={item}>
                <Link className={styles.link} to={"/destaques/" + item.id}>Ver publicação</Link>
                <Button variant="ghost" disabled={busy || !!selected || item.egresso?.id_egresso == null} onClick={() => openEditor({ id: item.egresso.id_egresso, nome: item.egresso.nome, foto: item.egresso.foto, publication: item })}>Editar destaque</Button>
                <Button variant="ghost" disabled={busy || !!selected} onClick={() => setConfirmation({ path: "/api/coordenadores/deletar/destaque/" + item.id, description: `O destaque “${item.titulo}” será removido da galeria e do perfil do egresso.`, success: "Destaque excluído com sucesso." })}>Excluir destaque</Button>
              </ManagementRecord>) : <p className={styles.empty}>{highlightQuery ? "Nenhuma publicação corresponde à pesquisa." : "Nenhum destaque publicado por esta conta."}</p>}
            </div>}
            {publicationTab !== "published" && <div id="drafts" className={styles.recordGroup}><h3 className={styles.groupTitle}>Rascunhos privados</h3>
              {drafts.loading ? <LoadingState label="Carregando rascunhos…" /> : drafts.error ? <ErrorState description={drafts.error} onRetry={drafts.retry} /> : draftItems.length ? draftItems.map(item => <ManagementRecord key={item.id} item={item} draft>
                <Button variant="ghost" disabled={busy || !!selected || item.egresso?.id_egresso == null} onClick={() => openEditor({ id: item.egresso.id_egresso, nome: item.egresso.nome, foto: item.egresso.foto, draft: item })}>Retomar rascunho</Button>
                <Button variant="ghost" disabled={busy || !!selected} onClick={() => setConfirmation({ path: "/api/gestao/rascunhos/" + item.id, description: `O rascunho “${item.titulo || "Sem título"}” será excluído.`, success: "Rascunho excluído." })}>Excluir rascunho</Button>
              </ManagementRecord>) : <p className={styles.empty}>{highlightQuery ? "Nenhum rascunho corresponde à pesquisa." : "Salve um destaque como rascunho para continuar depois."}</p>}
            </div>}
          </div>
        </section>
      </div>}
      {selected && <div className={styles.composer}><HighlightComposer key={(selected.publication ? "edit-" + selected.publication.id : selected.draft ? "draft-" + selected.draft.id : "new-" + selected.id)} egresso={selected} busy={busy} initialValues={selected.publication || selected.draft || undefined} initialDraft={selected.draft} editing={!!selected.publication} onStateChange={setEditorState} operationError={mutationError} onReloadDraft={reloadDraft} onSaveDraft={saveDraft} onPublish={publish} onClose={() => { setSelected(null); setEditorState({ dirty: false, pending: false }); drafts.retry(); }} /></div>}
      {!dashboard.loading && !dashboard.error && <div className={styles.sections}>
        <section id="courses" className={styles.panel}><p className={styles.eyebrow}>Formação e comunidade</p><h2>Meus cursos</h2><p className={styles.sectionDescription}>Cursos sob sua responsabilidade e seus vínculos de formação.</p>
          {dashboard.sections.cursos ? <ErrorState description={dashboard.sections.cursos} onRetry={dashboard.reload} /> : dashboard.cursos.length ? <>
            <Field label="Buscar nos meus cursos" name="buscaCursos" type="search" value={courseQuery} onChange={event => setCourseQuery(event.target.value)} placeholder="Nome ou nível" />
            <p className={styles.count} role="status">{courses.length} de {dashboard.cursos.length} cursos</p>
            <div className={styles.table}><PortalTable key={courseQuery} ariaLabel="Meus cursos" keyField="id_curso" columns={[{ name: "Curso", selector: row => row.nome, sortable: true, wrap: true }, { name: "Nível", selector: row => row.nivel, sortable: true }, { name: "Vínculos", selector: row => row.egressosError ? "Indisponível" : row.egressos.length }]} data={courses} paginationResetDefaultPage={!!courseQuery} /></div>
          </> : <p className={styles.empty}>Ainda não há cursos vinculados a esta conta. Solicite à coordenação geral o cadastro de um curso sob sua responsabilidade.</p>}
        </section>
        <section id="graduates" className={styles.panel}><p className={styles.eyebrow}>Pessoas e trajetórias</p><h2>Egressos por curso</h2><p className={styles.sectionDescription}>Cada linha representa uma formação. A mesma pessoa pode aparecer em mais de um curso.</p>
          {dashboard.sections.cursos ? <ErrorState description="Os cursos precisam estar disponíveis para consultar seus egressos." onRetry={dashboard.reload} /> : dashboard.cursos.length ? <>
            <div className={styles.filters}><Field label="Buscar egressos" name="buscaEgressos" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome ou e-mail" /><Field as={Select} label="Filtrar por curso" name="curso" value={courseId} onChange={event => setCourseId(event.target.value)}><option value="">Todos os meus cursos</option>{dashboard.cursos.map(course => <option key={course.id_curso} value={course.id_curso}>{course.nome}</option>)}</Field><Button variant="secondary" onClick={() => { setQuery(""); setCourseId(""); }}>Limpar pesquisa</Button></div>
            {failedCourses.map(course => <ErrorState key={course.id_curso} title={"Egressos indisponíveis: " + course.nome} description={course.egressosError} onRetry={dashboard.reload} />)}
            <p className={styles.count} role="status">{rows.length} vínculos carregados nesta consulta{failedCourses.length ? "; há cursos indisponíveis" : ""}.</p>
            <div className={styles.table}><PortalTable key={query + ":" + courseId} ariaLabel="Egressos por curso" columns={columns} data={rows} keyField="rowKey" paginationResetDefaultPage={!!query || !!courseId} /></div>
          </> : <p className={styles.empty}>Os egressos aparecerão aqui quando estiverem vinculados aos seus cursos.</p>}
        </section>
      </div>}
      <PublicationSuccessDialog result={publicationResult} onClose={() => setPublicationResult(null)} />
      <ConfirmDialog open={!!confirmation} title={confirmation?.title} confirmLabel={confirmation?.label} error={notice?.variant === "error" ? notice.text : undefined} description={confirmation?.description} pending={busy} onCancel={() => setConfirmation(null)} onConfirm={remove} />
    </AdminShell>
  );
}
