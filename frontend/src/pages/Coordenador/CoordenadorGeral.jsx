import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import useDashboard from "../../hooks/useDashboard";
import useMutation from "../../hooks/useMutation";
import { sameId } from "../../services/dashboard.js";
import AdminShell from "../../components/ui/AdminShell";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
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
  const update = event => setCourse(value => ({ ...value, [event.target.name]: event.target.value }));
  const save = async event => {
    event.preventDefault();
    if (await run(() => axios.post(API_URL + "/api/coordenadores/salvar/curso", course), "Curso cadastrado com sucesso.", dashboard.reload)) setCourse(empty);
  };
  const remove = async () => {
    if (await run(() => axios.delete(API_URL + confirmation.path), confirmation.success, dashboard.reload)) setConfirmation(null);
  };
  const courseColumns = [
    { name: "Curso", selector: row => row.nome, sortable: true, wrap: true },
    { name: "Nível", selector: row => row.nivel, sortable: true },
    { name: "Ações", cell: row => <Button variant="ghost" disabled={busy} onClick={() => setConfirmation({ path: "/api/coordenadores/deletar/curso/" + row.id_curso, description: "O curso “" + row.nome + "” será excluído. Confira seus vínculos antes de continuar.", success: "Curso excluído com sucesso." })}>Excluir</Button> },
  ];
  const coordinatorColumns = [
    { name: "Login", selector: row => row.login, sortable: true },
    { name: "Tipo", selector: row => row.tipo, sortable: true },
    { name: "Cursos", selector: row => dashboard.sections.cursos ? "Indisponível" : dashboard.cursos.filter(course => sameId(course.coordenador?.id_coordenador, row.id_coordenador)).length },
    { name: "Ações", cell: row => <Button variant="ghost" disabled={busy} onClick={() => setConfirmation({ path: "/api/coordenadores/deletar/coordenador/" + row.id_coordenador, description: "A conta de " + row.login + " será excluída. Esta ação não pode ser desfeita.", success: "Coordenador excluído com sucesso." })}>Excluir</Button> },
  ];
  return (
    <AdminShell title="Uma visão de toda a comunidade." description="Gerencie as contas de coordenação e organize os cursos que conectam a formação dos egressos."
      login={dashboard.coordenador?.login} sections={[["coordinators", "Coordenadores"], ["courses", "Todos os cursos"], ["new-course", "Cadastrar curso"]]}
      stats={!dashboard.loading && !dashboard.error ? [["Outras contas de coordenação", dashboard.sections.coordenadores ? "Indisponível" : dashboard.coordenadores.length], ["Cursos cadastrados", dashboard.sections.cursos ? "Indisponível" : dashboard.cursos.length]] : undefined}>
      {notice && <Notice variant={notice.variant} className={styles.notice}><p>{notice.text}</p></Notice>}
      {dashboard.loading ? <LoadingState label="Carregando gestão do portal…" /> : dashboard.error ? <ErrorState description={dashboard.error} onRetry={dashboard.reload} /> : (
        <div className={styles.sections}>
          <section id="coordinators" className={styles.panel}><h2>Coordenadores</h2>{dashboard.sections.coordenadores ? <ErrorState description={dashboard.sections.coordenadores} onRetry={dashboard.reload} /> : <div className={styles.table}>
            <PortalTable keyField="id_coordenador" columns={coordinatorColumns} data={dashboard.coordenadores} expandableRows
              expandableRowsComponent={({ data }) => <div className={styles.subsection}><h3>Cursos de {data.login}</h3>{dashboard.sections.cursos ? <ErrorState description={dashboard.sections.cursos} onRetry={dashboard.reload} /> : <PortalTable columns={courseColumns} data={dashboard.cursos.filter(course => sameId(course.coordenador?.id_coordenador, data.id_coordenador))} keyField="id_curso" pagination={false} />}</div>} />
          </div>}</section>
          <section id="courses" className={styles.panel}><h2>Cursos cadastrados</h2>{dashboard.sections.cursos ? <ErrorState description={dashboard.sections.cursos} onRetry={dashboard.reload} /> : <div className={styles.table}><PortalTable columns={courseColumns} data={dashboard.cursos} keyField="id_curso" /></div>}</section>
          <section id="new-course" className={styles.panel}><h2>Cadastrar novo curso</h2>
            <form className={styles.form} onSubmit={save} aria-busy={busy}>
              <div className={styles.columns}>
                <Field label="Nome do curso" name="nome" value={course.nome} onChange={update} placeholder="Ex.: Ciência da Computação" required disabled={busy} />
                <Field label="Nível de formação" name="nivel" value={course.nivel} onChange={update} placeholder="Ex.: Graduação" required disabled={busy} />
              </div>
              {dashboard.sections.coordenadores && <ErrorState description="Carregue as contas de coordenação para escolher o responsável pelo curso." onRetry={dashboard.reload} />}
              <Field as={Select} label="Coordenador responsável" name="id_coordenador" value={course.id_coordenador} onChange={update} required disabled={busy || !!dashboard.sections.coordenadores}>
                <option value="">Selecione uma conta de coordenação</option>{dashboard.coordenadores.map(item => <option value={item.id_coordenador} key={item.id_coordenador}>{item.login}</option>)}
              </Field>
              <div className={styles.actions}><Button type="submit" loading={busy} loadingLabel="Cadastrando…" disabled={!!dashboard.sections.coordenadores || !dashboard.coordenadores.length}>Cadastrar curso</Button><Button variant="secondary" disabled={busy} onClick={() => setCourse(empty)}>Limpar campos</Button></div>
            </form>
          </section>
        </div>
      )}
      <ConfirmDialog open={!!confirmation} error={notice?.variant === "error" ? notice.text : undefined} pending={busy} description={confirmation?.description} onCancel={() => setConfirmation(null)} onConfirm={remove} />
    </AdminShell>
  );
}
