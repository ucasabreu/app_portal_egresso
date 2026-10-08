import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaSearch, FaSlidersH, FaTimes, FaUsers } from "react-icons/fa";
import usePagedCollection from "../../hooks/usePagedCollection.js";
import { emptyFilters, filterLabels, readDirectory, directorySearch, directoryFilterErrors, paginationItems } from "../../utils/egressoDirectory.js";
import PageBanner from "../../components/ui/PageBanner";
import Container from "../../components/ui/Container";
import Network from "../../assets/network.jpg";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import CopyLink from "../../components/ui/CopyLink";
import EgressoCard from "../../components/ui/EgressoCard";
import Button from "../../components/Button/Button";
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
  const [expanded, setExpanded] = useState(() => typeof window === "undefined" || !window.matchMedia?.("(max-width: 47.99rem)")?.matches);
  const [errors, setErrors] = useState({});
  const formId = useId();
  const filterForm = useRef(null);
  const filterToggle = useRef(null);
  const directory = usePagedCollection("/api/publico/egressos?" + directorySearch(view));
  const page = directory.data;
  const details = Object.fromEntries(page.items.map(person => [person.id_egresso, { cursos: person.cursos, cargos: person.cargos, errors: {} }]));
  const canonical = directorySearch({ ...view, page: directory.loading || directory.error ? view.page : page.page });
  const returnPath = "/egressos/listar" + (canonical ? "?" + canonical : "");
  const active = Object.entries(view.filters).filter(([, value]) => value);

  useEffect(() => { setDraft(JSON.parse(filtersKey)); setErrors({}); }, [filtersKey]);
  useEffect(() => {
    if (search !== canonical) setParams(canonical, { replace: true });
  }, [search, canonical, setParams]);

  const changeView = changes => setParams(directorySearch({ ...view, ...changes }));
  const reset = () => { setDraft(emptyFilters); setErrors({}); changeView({ filters: emptyFilters, page: 1 }); };
  const refresh = directory.retry;
  const update = event => {
    const { name, value } = event.target;
    setDraft(values => ({ ...values, [name]: value }));
    setErrors(values => ({ ...values, [name]: "" }));
  };
  const applyFilters = event => {
    event.preventDefault();
    const nextErrors = directoryFilterErrors(draft);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      setExpanded(true);
      requestAnimationFrame(() => filterForm.current?.elements.namedItem(firstError)?.focus());
      return;
    }
    changeView({ filters: readDirectory(new URLSearchParams(draft)).filters, page: 1 });
  };
  const pageNumbers = paginationItems(page.page, page.pages);
  const courseSuggestions = [...new Set(page.items.flatMap(person => person.cursos || []).map(item => item.curso?.nome).filter(Boolean))];

  return (
    <Container as="section" className={styles.page}>
      <PageBanner breadcrumb={[{ label: "Início", to: "/" }, { label: "Comunidade" }]} title="Descubra trajetórias da nossa comunidade"
        description="Reencontre pessoas e conheça os caminhos de quem passou pela universidade. Busque por nome, curso ou experiência e explore cada história."
        image={Network} imageAlt="Pessoas reunidas em um encontro de convivência e troca de experiências" caption={<>Diferentes caminhos.<br />Um vínculo em comum.</>} />
      <section className={styles.filters} aria-label="Filtros de egressos" onKeyDown={event => {
        if (event.key === "Escape" && expanded) { event.preventDefault(); setExpanded(false); filterToggle.current?.focus(); }
      }}>
        <div className={styles.filterHeading}>
          <p>Busque pessoas, cursos e experiências.</p>
        </div>
        <form ref={filterForm} className={styles.form} onSubmit={applyFilters} noValidate>
          <div className={styles.searchRow}>
            <div className={styles.searchInput}><FaSearch aria-hidden="true" /><Field className={styles.searchField} label="Buscar por nome" hideLabel name="nome" type="search" value={draft.nome} onChange={update} placeholder="Buscar pelo nome do egresso…" /></div>
            <div className={styles.formActions}><Button type="submit">Buscar <FaArrowRight aria-hidden="true" /></Button><Button ref={filterToggle} variant="secondary" aria-expanded={expanded} aria-controls={formId} onClick={() => setExpanded(value => !value)}><FaSlidersH aria-hidden="true" />{expanded ? "Recolher filtros" : "Mais filtros"}</Button></div>
          </div>
          <div id={formId} className={styles.advanced} hidden={!expanded}>
            <Field className={styles.filterField} label="Curso" name="curso" list={formId + "-courses"} value={draft.curso} onChange={update} placeholder="Ex.: Ciência da Computação" />
            <Field className={styles.filterField} label="Cargo ou atividade" name="cargo" value={draft.cargo} onChange={update} placeholder="Ex.: Analista" />
            <Field className={styles.filterField} label="Ano de ingresso" name="anoInicio" error={errors.anoInicio} type="number" min={1900} max={2100} step={1} value={draft.anoInicio} onChange={update} placeholder="Ex.: 2018" aria-describedby={formId + "-help"} />
            <Field className={styles.filterField} label="Ano de conclusão" name="anoFim" error={errors.anoFim} type="number" min={1900} max={2100} step={1} value={draft.anoFim} onChange={update} placeholder="Ex.: 2022" aria-describedby={formId + "-help"} />
          </div>
          {expanded && <p id={formId + "-help"} className={styles.filterHelp}>Os anos se referem à formação acadêmica. O cargo considera a descrição da experiência profissional.</p>}
          <datalist id={formId + "-courses"}>{courseSuggestions.map(name => <option key={name} value={name} />)}</datalist>
        </form>
      </section>
      {active.length > 0 && <div className={styles.chips} aria-label="Filtros ativos">
        {active.map(([key, value]) => <button key={key} type="button" className={styles.chip} aria-label={`Remover filtro ${filterLabels[key]}: ${value}`} onClick={() => changeView({ filters: { ...view.filters, [key]: "" }, page: 1 })}>{filterLabels[key]}: {value}<FaTimes aria-hidden="true" /></button>)}
        <Button variant="secondary" onClick={reset}>Limpar todos</Button>
      </div>}
      <div className={styles.resultsHeader}>
        <div><h2 id="directory-results">{directory.loading ? "Comunidade de egressos" : directory.error ? "Comunidade de egressos" : `${page.total} ${page.total === 1 ? "egresso encontrado" : "egressos encontrados"}`}</h2><p className={styles.count} role="status">{directory.loading ? "Buscando egressos…" : directory.error ? "Consulta indisponível" : page.total ? `Mostrando ${page.first}–${page.last} de ${page.total} ${page.total === 1 ? "egresso" : "egressos"}` : "Nenhum egresso encontrado"}</p></div>
        <div className={styles.controls}>
          <Field className={styles.orderField} as={Select} label="Ordenar por" value={view.order} onChange={event => changeView({ order: event.target.value, page: 1 })}><option value="nome-asc">Nome: A a Z</option><option value="nome-desc">Nome: Z a A</option></Field>
          <details className={styles.queryOptions}><summary>Opções da consulta</summary><div><Button variant="ghost" onClick={refresh} disabled={directory.loading}>Atualizar lista</Button><CopyLink key={returnPath} path={returnPath} /><Field as={Select} label="Por página" value={view.size} onChange={event => changeView({ size: Number(event.target.value), page: 1 })}>{[6, 12, 24].map(size => <option key={size} value={size}>{size} egressos</option>)}</Field></div></details>
        </div>
      </div>
      {directory.loading ? <LoadingState label="Carregando a comunidade…" /> : directory.error ? <ErrorState description={directory.error} onRetry={refresh} /> : !page.total ? <EmptyState title={active.length ? "Nenhuma trajetória corresponde à pesquisa" : "A comunidade ainda não tem egressos cadastrados"} description={active.length ? "Remova um filtro ou ajuste os termos para ampliar a busca." : "Os perfis aparecerão aqui quando forem cadastrados no portal."} action={active.length ? <Button variant="secondary" onClick={reset}>Mostrar todos os egressos</Button> : undefined} /> : <>
        <div className={styles.grid}>{page.items.map(egresso => <EgressoCard key={egresso.id_egresso} egresso={egresso} details={details[egresso.id_egresso]} directory={returnPath} headingLevel={3} />)}</div>
        {page.pages > 1 && <nav className={styles.pagination} aria-label="Páginas de egressos">
          <Button variant="secondary" disabled={page.page === 1} onClick={() => changeView({ page: page.page - 1 })} aria-label="Página anterior"><FaChevronLeft aria-hidden="true" /></Button>
          {pageNumbers.map((number, index) => typeof number === "string" ? <span key={"gap-" + index} aria-hidden="true">…</span> : <Button key={number} variant="secondary" aria-label={`Página ${number}`} aria-current={page.page === number ? "page" : undefined} onClick={() => changeView({ page: number })}>{number}</Button>)}
          <Button variant="secondary" disabled={page.page === page.pages} onClick={() => changeView({ page: page.page + 1 })} aria-label="Próxima página"><FaChevronRight aria-hidden="true" /></Button><p>Página {page.page} de {page.pages}</p>
        </nav>}
      </>}
      <aside className={styles.invitation} aria-labelledby="community-invitation">
        <FaUsers className={styles.invitationIcon} aria-hidden="true" /><div><h2 id="community-invitation">Sua trajetória também faz parte desta rede</h2><p>Apresente sua formação e suas experiências para manter viva a conexão com a comunidade.</p></div><Link to="/edit-egresso">Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link>
      </aside>
    </Container>
  );
}
