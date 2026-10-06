import { useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useEgressoDirectory, useDirectoryDetails } from "../../hooks/useEgressoDirectory.js";
import { emptyFilters, filterLabels, readDirectory, directorySearch, directoryPage } from "../../utils/egressoDirectory.js";
import PageShell from "../../components/ui/PageShell";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import CopyLink from "../../components/ui/CopyLink";
import EgressoCard from "../../components/ui/EgressoCard";
import Button from "../../components/Button/Button";
import Notice from "../../components/feedback/Notice";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import styles from "./Directory.module.css";

export default function EgressosPage() {
  const [params, setParams] = useSearchParams();
  const search = params.toString();
  const view = useMemo(() => readDirectory(search), [search]);
  const filtersKey = JSON.stringify(view.filters);
  const [draft, setDraft] = useState(view.filters);
  const [expanded, setExpanded] = useState(() => !window.matchMedia?.("(max-width: 48rem)").matches);
  const formId = useId();
  const directory = useEgressoDirectory(view.filters);
  const page = useMemo(() => directoryPage(directory.data, view), [directory.data, view]);
  const details = useDirectoryDetails(directory.loading || directory.error ? [] : page.items.map(person => person.id_egresso));
  const canonical = directorySearch({ ...view, page: directory.loading || directory.error ? view.page : page.page });
  const returnPath = "/egressos/listar" + (canonical ? "?" + canonical : "");
  const active = Object.entries(view.filters).filter(([, value]) => value);

  useEffect(() => { setDraft(JSON.parse(filtersKey)); }, [filtersKey]);
  useEffect(() => {
    if (search !== canonical) setParams(canonical, { replace: true });
  }, [search, canonical, setParams]);

  const changeView = changes => setParams(directorySearch({ ...view, ...changes }));
  const reset = () => { setDraft(emptyFilters); changeView({ filters: emptyFilters, page: 1 }); };
  const refresh = () => { details.clear(); directory.reload(); };
  const update = event => setDraft(values => ({ ...values, [event.target.name]: event.target.value }));
  const firstNumber = Math.max(1, Math.min(page.page - 2, page.pages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, page.pages) }, (_, index) => firstNumber + index);

  return (
    <PageShell title="Pessoas que fazem parte da nossa história." description="Encontre egressos por nome, formação ou experiência profissional. Abra um perfil para conhecer a trajetória completa."
      actions={<><Button variant="secondary" onClick={refresh} disabled={directory.loading}>Atualizar lista</Button><CopyLink key={returnPath} path={returnPath} /></>}>
      <section className={styles.filters} aria-label="Filtros de egressos">
        <div className={styles.filterHeading}>
          <div><h2>Encontre uma trajetória</h2><p>Combine os filtros para refinar a pesquisa.</p></div>
          <Button variant="secondary" aria-expanded={expanded} aria-controls={formId} onClick={() => setExpanded(value => !value)}>{expanded ? "Recolher filtros" : "Mostrar filtros"}{active.length > 0 ? ` (${active.length})` : ""}</Button>
        </div>
        <form id={formId} className={styles.form} hidden={!expanded} onSubmit={event => { event.preventDefault(); changeView({ filters: readDirectory(new URLSearchParams(draft)).filters, page: 1 }); }}>
          <Field label="Nome" name="nome" value={draft.nome} onChange={update} placeholder="Nome do egresso" />
          <Field label="Curso" name="curso" value={draft.curso} onChange={update} placeholder="Área de formação" />
          <Field label="Cargo" name="cargo" value={draft.cargo} onChange={update} placeholder="Experiência profissional" />
          <Field label="Ano de ingresso" name="anoInicio" type="number" min={1900} max={2100} step={1} value={draft.anoInicio} onChange={update} placeholder="Ex.: 2018" />
          <Field label="Ano de conclusão" name="anoFim" type="number" min={1900} max={2100} step={1} value={draft.anoFim} onChange={update} placeholder="Ex.: 2022" />
          <div className={styles.formActions}><Button type="submit">Aplicar filtros</Button><Button variant="secondary" onClick={reset}>Limpar filtros</Button></div>
        </form>
      </section>
      {active.length > 0 && <div className={styles.chips} aria-label="Filtros ativos">
        {active.map(([key, value]) => <button key={key} type="button" className={styles.chip} aria-label={`Remover filtro ${filterLabels[key]}: ${value}`} onClick={() => changeView({ filters: { ...view.filters, [key]: "" }, page: 1 })}>{filterLabels[key]}: {value}<FaTimes aria-hidden="true" /></button>)}
        <Button variant="secondary" onClick={reset}>Limpar todos</Button>
      </div>}
      <div className={styles.resultsHeader}>
        <div><h2>Egressos da comunidade</h2><p className={styles.count} role="status">{directory.loading ? "Buscando egressos…" : directory.error ? "Consulta indisponível" : page.total ? `Mostrando ${page.first}–${page.last} de ${page.total} ${page.total === 1 ? "egresso" : "egressos"}` : "Nenhum egresso encontrado"}</p></div>
        <div className={styles.controls}>
          <Field as={Select} label="Ordenar por" value={view.order} onChange={event => changeView({ order: event.target.value, page: 1 })}><option value="nome-asc">Nome: A a Z</option><option value="nome-desc">Nome: Z a A</option></Field>
          <Field as={Select} label="Por página" value={view.size} onChange={event => changeView({ size: Number(event.target.value), page: 1 })}>{[6, 12, 24].map(size => <option key={size} value={size}>{size} egressos</option>)}</Field>
        </div>
      </div>
      {directory.loading ? <LoadingState label="Carregando a comunidade…" /> : directory.error ? <ErrorState description={directory.error} onRetry={refresh} /> : !page.total ? <EmptyState title={active.length ? "Nenhuma trajetória corresponde à pesquisa" : "A comunidade ainda não tem egressos cadastrados"} description={active.length ? "Remova um filtro ou ajuste os termos para ampliar a busca." : "Os perfis aparecerão aqui quando forem cadastrados no portal."} action={active.length ? <Button variant="secondary" onClick={reset}>Mostrar todos os egressos</Button> : undefined} /> : <>
        {details.loading && <p className={styles.status} role="status">Buscando formação e experiência dos perfis desta página…</p>}
        {details.hasErrors && <Notice variant="warning" className={styles.notice} title="Alguns detalhes não puderam ser carregados"><p>Os perfis continuam disponíveis. Tente novamente para consultar as formações e experiências indisponíveis.</p><Button variant="secondary" onClick={details.retry}>Tentar carregar detalhes novamente</Button></Notice>}
        <div className={styles.grid}>{page.items.map(egresso => <EgressoCard key={egresso.id_egresso} egresso={egresso} details={details.entries[egresso.id_egresso]} loading={details.loading} directory={returnPath} />)}</div>
        {page.pages > 1 && <nav className={styles.pagination} aria-label="Páginas de egressos">
          <Button variant="secondary" disabled={page.page === 1} onClick={() => changeView({ page: page.page - 1 })}>Anterior</Button>
          {pageNumbers.map(number => <Button key={number} variant="secondary" aria-label={`Página ${number}`} aria-current={page.page === number ? "page" : undefined} onClick={() => changeView({ page: number })}>{number}</Button>)}
          <Button variant="secondary" disabled={page.page === page.pages} onClick={() => changeView({ page: page.page + 1 })}>Próxima</Button><p>Página {page.page} de {page.pages}</p>
        </nav>}
      </>}
    </PageShell>
  );
}
