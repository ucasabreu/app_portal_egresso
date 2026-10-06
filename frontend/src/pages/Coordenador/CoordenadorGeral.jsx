import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import useDashboard from "../../hooks/useDashboard";
import useMutation from "../../hooks/useMutation";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import { sameId } from "../../services/dashboard.js";
import { courseErrors, matchesSearch, focusFirstError } from "../../utils/management.js";
import AdminShell from "../../components/ui/AdminShell";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import UnsavedChangesDialog from "../../components/ui/UnsavedChangesDialog";
import Button from "../../components/Button/Button";
import PortalTable from "../../components/Table/PortalTable";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import Notice from "../../components/feedback/Notice";
import styles from "./Dashboard.module.css";

const empty = { nome: "", nivel: "", id_coordenador: "" };
export default function CoordenadorGeral() {
  const { id } = useParams();
  const dashboard = useDashboard(id, true);
  const { busy, notice, run } = useMutation();
  const [course, setCourse] = useState(empty);
  const [confirmation, setConfirmation] = useState(null);
  const [errors, setErrors] = useState({});
  const [clear, setClear] = useState(false);
  const [review, setReview] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");
  const [coordinatorQuery, setCoordinatorQuery] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const form = useRef(null);
  const focusError = useRef(false);
  useEffect(() => { if (focusError.current && !review && Object.keys(errors).length) { focusError.current = false; focusFirstError(form.current, errors); } }, [review, errors]);
  const blocker = useUnsavedChanges(Object.values(course).some(Boolean), busy);
  const coordinator = course => course.coordenador?.login || dashboard.coordenadores.find(person => sameId(person.id_coordenador, course.coordenador?.id_coordenador))?.login || "Responsável não informado";
  const courses = dashboard.cursos.filter(course => (!responsibleId || sameId(course.coordenador?.id_coordenador, responsibleId)) && matchesSearch(courseQuery, course.nome, course.nivel, coordinator(course)));
  const coordinators = dashboard.coordenadores.filter(person => matchesSearch(coordinatorQuery, person.login, person.tipo));
  const update = event => { setCourse(value => ({ ...value, [event.target.name]: event.target.value })); setErrors(value => ({ ...value, [event.target.name]: "" })); setReview(false); };
  const save = async event => {
    event.preventDefault();
    const next = courseErrors(course, dashboard.coordenadores);
    setErrors(next);
    if (Object.keys(next).length) { focusError.current = true; setReview(false); return; }
    if (!review) { setReview(true); return; }
    if (await run(() => axios.post(API_URL + "/api/coordenadores/salvar/curso", course), "Curso cadastrado com sucesso.", dashboard.reload)) { setCourse(empty); setReview(false); }
  };
  const remove = async () => {
    if (await run(() => axios.delete(API_URL + confirmation.path), confirmation.success, dashboard.reload)) setConfirmation(null);
  };
  const courseColumns = [
    { name: "Curso", selector: row => row.nome, sortable: true, wrap: true },
    { name: "Nível", selector: row => row.nivel, sortable: true },
    { name: "Responsável", selector: row => coordinator(row), sortable: true, wrap: true },
    { name: "Ações", cell: row => <Button variant="ghost" disabled={busy} onClick={() => setConfirmation({ path: "/api/coordenadores/deletar/curso/" + row.id_curso, description: `O curso “${row.nome}”, sob responsabilidade de ${coordinator(row)}, será excluído. Cursos com formações vinculadas precisam ser desvinculados antes da exclusão.`, success: "Curso excluído com sucesso." })}>Excluir curso</Button> },
  ];
  const coordinatorColumns = [
    { name: "Login", selector: row => row.login, sortable: true },
    { name: "Tipo", selector: row => row.tipo, sortable: true },
    { name: "Cursos", selector: row => dashboard.sections.cursos ? "Indisponível" : dashboard.cursos.filter(course => sameId(course.coordenador?.id_coordenador, row.id_coordenador)).length },
    { name: "Ações", cell: row => <Button variant="ghost" disabled={busy} onClick={() => setConfirmation({ path: "/api/coordenadores/deletar/coordenador/" + row.id_coordenador, description: `A conta de ${row.login} será excluída. O serviço também tenta remover os cursos desta conta; revise os cursos e suas formações antes de continuar.`, success: "Coordenador excluído com sucesso." })}>Excluir conta</Button> },
  ];
  return (
    <AdminShell title="Uma visão de toda a comunidade." description="Gerencie as contas de coordenação e organize os cursos que conectam a formação dos egressos."
      login={dashboard.coordenador?.login} sections={[["coordinators", "Coordenadores"], ["courses", "Todos os cursos"], ["new-course", "Cadastrar curso"]]}
      stats={!dashboard.loading && !dashboard.error ? [["Outras contas de coordenação", dashboard.sections.coordenadores ? "Indisponível" : dashboard.coordenadores.length], ["Cursos cadastrados", dashboard.sections.cursos ? "Indisponível" : dashboard.cursos.length]] : undefined}>
      {notice && <Notice variant={notice.variant} className={styles.notice}><p>{notice.text}</p></Notice>}
      {dashboard.loading ? <LoadingState label="Carregando gestão do portal…" /> : dashboard.error ? <ErrorState description={dashboard.error} onRetry={dashboard.reload} /> : <div className={styles.sections}>
        <section id="coordinators" className={styles.panel}><h2>Coordenadores</h2>{dashboard.sections.coordenadores ? <ErrorState description={dashboard.sections.coordenadores} onRetry={dashboard.reload} /> : <>
          <Field label="Buscar contas de coordenação" name="buscaContas" value={coordinatorQuery} onChange={event => setCoordinatorQuery(event.target.value)} placeholder="Login ou tipo" /><p className={styles.count} role="status">{coordinators.length} de {dashboard.coordenadores.length} contas</p>
          <div className={styles.table}><PortalTable key={coordinatorQuery} keyField="id_coordenador" columns={coordinatorColumns} data={coordinators} expandableRows paginationResetDefaultPage={!!coordinatorQuery}
            expandableRowsComponent={({ data }) => <div className={styles.subsection}><h3>Cursos de {data.login}</h3>{dashboard.sections.cursos ? <ErrorState description={dashboard.sections.cursos} onRetry={dashboard.reload} /> : <PortalTable columns={courseColumns} data={dashboard.cursos.filter(course => sameId(course.coordenador?.id_coordenador, data.id_coordenador))} keyField="id_curso" pagination={false} />}</div>} /></div>
        </>}</section>
        <section id="courses" className={styles.panel}><h2>Cursos cadastrados</h2>{dashboard.sections.cursos ? <ErrorState description={dashboard.sections.cursos} onRetry={dashboard.reload} /> : <>
          <div className={styles.filters}><Field label="Buscar cursos" name="buscaCursos" value={courseQuery} onChange={event => setCourseQuery(event.target.value)} placeholder="Nome, nível ou responsável" /><Field as={Select} label="Responsável pelo curso" value={responsibleId} onChange={event => setResponsibleId(event.target.value)}><option value="">Todos os responsáveis</option>{[dashboard.coordenador, ...dashboard.coordenadores].filter(Boolean).map(person => <option key={person.id_coordenador} value={person.id_coordenador}>{person.login}</option>)}</Field><Button variant="secondary" onClick={() => { setCourseQuery(""); setResponsibleId(""); }}>Limpar pesquisa</Button></div>
          <p className={styles.count} role="status">{courses.length} de {dashboard.cursos.length} cursos</p><div className={styles.table}><PortalTable key={courseQuery + ":" + responsibleId} columns={courseColumns} data={courses} keyField="id_curso" paginationResetDefaultPage={!!courseQuery || !!responsibleId} /></div>
        </>}</section>
      </div>}
      {!dashboard.loading && !dashboard.error && <section id="new-course" className={`${styles.panel} ${styles.composer}`}><h2>Cadastrar novo curso</h2>
        <form ref={form} className={styles.form} onSubmit={save} noValidate aria-busy={busy}>
          {review ? <><Notice title="Confira o vínculo antes de cadastrar"><p>O curso ficará associado à conta indicada abaixo.</p></Notice><dl className={styles.review}><div><dt>Curso</dt><dd>{course.nome}</dd></div><div><dt>Nível</dt><dd>{course.nivel}</dd></div><div><dt>Responsável</dt><dd>{dashboard.coordenadores.find(person => sameId(person.id_coordenador, course.id_coordenador))?.login}</dd></div></dl></> : <>
            <div className={styles.columns}><Field label="Nome do curso" name="nome" value={course.nome} onChange={update} error={errors.nome} hint="Use letras e espaços." required disabled={busy} /><Field label="Nível de formação" name="nivel" value={course.nivel} onChange={update} error={errors.nivel} placeholder="Ex.: Graduação" required disabled={busy} /></div>
            {dashboard.sections.coordenadores && <ErrorState description="Carregue as contas de coordenação para escolher o responsável pelo curso." onRetry={dashboard.reload} />}
            <Field as={Select} label="Coordenador responsável" name="id_coordenador" value={course.id_coordenador} onChange={update} error={errors.id_coordenador} required disabled={busy || !!dashboard.sections.coordenadores}><option value="">Selecione uma conta de coordenação</option>{dashboard.coordenadores.map(item => <option value={item.id_coordenador} key={item.id_coordenador}>{item.login}</option>)}</Field>
          </>}
          <div className={styles.actions}><Button type="submit" loading={busy} loadingLabel="Cadastrando…" disabled={!!dashboard.sections.coordenadores || !dashboard.coordenadores.length}>{review ? "Cadastrar curso" : "Revisar curso"}</Button>{review && <Button variant="secondary" disabled={busy} onClick={() => setReview(false)}>Continuar editando</Button>}<Button variant="secondary" disabled={busy} onClick={() => setClear(true)}>Limpar campos</Button></div>
        </form>
      </section>}
      <ConfirmDialog open={!!confirmation} error={notice?.variant === "error" ? notice.text : undefined} pending={busy} description={confirmation?.description} onCancel={() => setConfirmation(null)} onConfirm={remove} />
      <ConfirmDialog open={clear} title="Limpar os dados do curso?" description="Os dados preenchidos ainda não foram cadastrados." confirmLabel="Limpar campos" onCancel={() => setClear(false)} onConfirm={() => { setCourse(empty); setErrors({}); setReview(false); setClear(false); }} />
      <UnsavedChangesDialog blocker={blocker} pending={busy} />
    </AdminShell>
  );
}
