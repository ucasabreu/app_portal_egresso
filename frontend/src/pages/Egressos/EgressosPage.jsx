import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaArrowRight } from "react-icons/fa";
import { API_URL } from "../../config/config.js";
import { errorMessage } from "../../utils/presentation";
import { egressoQueries, intersectEgressos } from "../../utils/egressoFilters";
import PageShell from "../../components/ui/PageShell";
import Field from "../../components/ui/Field";
import Photo from "../../components/ui/Photo";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import styles from "../../styles/Content.module.css";

const initialFilters = { nome: "", curso: "", cargo: "", anoInicio: "", anoFim: "" };
export default function EgressosPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ data: [], loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: [], loading: true, error: "" });
    Promise.all(egressoQueries(applied).map(path => axios.get(API_URL + path, { signal: controller.signal })))
      .then(responses => {
        if (responses.some(response => !Array.isArray(response.data))) throw new Error("O serviço retornou dados em um formato inesperado.");
        if (!controller.signal.aborted) setState({ data: intersectEgressos(responses.map(response => response.data)), loading: false, error: "" });
      })
      .catch(error => {
        if (!controller.signal.aborted) setState({ data: [], loading: false, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [applied, revision]);
  const update = event => setFilters(values => ({ ...values, [event.target.name]: event.target.value }));
  const reset = () => { setFilters(initialFilters); setApplied(initialFilters); setRevision(value => value + 1); };

  return (
    <PageShell title="Pessoas que fazem parte da nossa história." description="Encontre egressos por nome, formação ou experiência profissional. Abra um perfil para conhecer a trajetória completa.">
      <form className={styles.toolbar} onSubmit={event => { event.preventDefault(); setApplied({ ...filters }); }}>
        <Field label="Nome" name="nome" value={filters.nome} onChange={update} placeholder="Nome do egresso" />
        <Field label="Curso" name="curso" value={filters.curso} onChange={update} placeholder="Área de formação" />
        <Field label="Cargo" name="cargo" value={filters.cargo} onChange={update} placeholder="Experiência profissional" />
        <Field label="Ano de ingresso" name="anoInicio" type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={filters.anoInicio} onChange={update} placeholder="Ex.: 2018" />
        <Field label="Ano de conclusão" name="anoFim" type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={filters.anoFim} onChange={update} placeholder="Ex.: 2022" />
        <Button type="submit">Aplicar filtros</Button>
        <Button variant="secondary" onClick={reset}>Limpar filtros</Button>
      </form>
      {state.loading ? <LoadingState label="Buscando egressos…" /> : state.error ? <ErrorState description={state.error} onRetry={() => setRevision(value => value + 1)} /> : (
        <>
          <p className={styles.count} role="status">{state.data.length} {state.data.length === 1 ? "egresso encontrado" : "egressos encontrados"}</p>
          {state.data.length === 0 ? <EmptyState action={<Button variant="secondary" onClick={reset}>Mostrar todos os egressos</Button>} /> : (
            <div className={styles.grid}>
              {state.data.map(egresso => (
                <article className={styles.card} key={egresso.id_egresso}>
                  <div className={styles.body}>
                    <Photo src={egresso.foto} alt="" className={styles.avatar} />
                    <span className={styles.tag}>Nossa comunidade</span>
                    <h2>{egresso.nome}</h2>
                    <p>{egresso.descricao || "Conheça a formação e as experiências deste egresso."}</p>
                    <Link to={"/egresso_view/" + egresso.id_egresso} className={styles.link}>Conhecer trajetória <FaArrowRight aria-hidden="true" /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
