import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import { orderedDepoimentos, depoimentoYear, depoimentosPath } from "../../utils/depoimentos.js";
import Container from "../../components/ui/Container";
import EditorialHeader from "../../components/ui/EditorialHeader";
import DepoimentoCard from "../../components/ui/DepoimentoCard";
import CopyLink from "../../components/ui/CopyLink";
import Field from "../../components/ui/Field";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import styles from "./Depoimento.module.css";

export default function Depoimento() {
  const [params, setParams] = useSearchParams();
  const search = params.toString();
  const applied = depoimentoYear(params.get("ano"));
  const canonical = applied ? new URLSearchParams({ ano: applied }).toString() : "";
  const [year, setYear] = useState(applied);
  const [yearError, setYearError] = useState("");
  const { data, loading, error, retry } = useCollection(depoimentosPath(applied));
  const items = useMemo(() => orderedDepoimentos(data), [data]);
  const path = "/egressos/depoimentos" + (canonical ? "?" + canonical : "");

  useEffect(() => { setYear(applied); setYearError(""); }, [applied]);
  useEffect(() => {
    if (search !== canonical) setParams(canonical, { replace: true });
  }, [search, canonical, setParams]);
  const reset = () => { setYear(""); setYearError(""); setParams({}); };
  const filterYear = event => {
    event.preventDefault();
    const value = depoimentoYear(year);
    if (year.trim() && !value) {
      setYearError("Informe um ano inteiro entre 1900 e 2100.");
      event.currentTarget.elements.namedItem("ano")?.focus();
      return;
    }
    setYearError("");
    setParams(value ? { ano: value } : {});
  };

  return (
    <Container className={styles.page}>
      <EditorialHeader breadcrumb={[{ label: "Início", to: "/" }, { label: "Depoimentos" }]} eyebrow="Vozes da comunidade" title="Experiências que atravessam gerações." description="Memórias, aprendizados e novos caminhos, contados pelos próprios egressos. Leia os relatos e conheça as pessoas por trás de cada história." actions={<CopyLink key={path} path={path} />} />
      <form className={styles.toolbar} onSubmit={filterYear} noValidate aria-label="Filtrar depoimentos por ano">
        <Field label="Ano de publicação" name="ano" type="text" inputMode="numeric" placeholder="Ex.: 2024" value={year} error={yearError} onChange={event => { setYear(event.target.value); setYearError(""); }} hint="Ano inteiro entre 1900 e 2100. Deixe em branco para ler todos os anos." />
        <div className={styles.actions}><Button type="submit">Buscar depoimentos</Button><Button variant="secondary" onClick={reset}>Mostrar todos</Button></div>
      </form>
      <section aria-labelledby="testimonials-title" aria-busy={loading}>
        <div className={styles.heading}>
          <div><h2 id="testimonials-title">{applied ? `Relatos publicados em ${applied}` : "Memórias compartilhadas"}</h2><p>Do mais recente ao mais antigo. Expanda os textos longos para continuar a leitura.</p></div>
          <p className={styles.count} role="status">{loading ? "Buscando depoimentos…" : error ? "Consulta indisponível" : `${items.length} ${items.length === 1 ? "depoimento encontrado" : "depoimentos encontrados"}`}</p>
        </div>
        {loading ? <LoadingState label="Carregando os relatos da comunidade…" /> : error ? <ErrorState description={error} onRetry={retry} /> : !items.length ? (
          <EmptyState title={applied ? `Nenhum depoimento publicado em ${applied}` : "As primeiras memórias ainda serão compartilhadas"} description={applied ? "Experimente outro ano ou consulte todos os depoimentos." : "Os relatos aparecerão aqui quando forem registrados pelos egressos em seus perfis."} action={applied ? <Button variant="secondary" onClick={reset}>Consultar todos os anos</Button> : undefined} />
        ) : <div className={styles.grid}>{items.map(item => <DepoimentoCard key={item.id_depoimento} depoimento={item} headingLevel={3} />)}</div>}
      </section>
    </Container>
  );
}
