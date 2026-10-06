import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import { orderedDepoimentos, depoimentoYear, depoimentosPath } from "../../utils/depoimentos.js";
import PageShell from "../../components/ui/PageShell";
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
  const { data, loading, error, retry } = useCollection(depoimentosPath(applied));
  const items = useMemo(() => orderedDepoimentos(data), [data]);
  const path = "/egressos/depoimentos" + (canonical ? "?" + canonical : "");

  useEffect(() => { setYear(applied); }, [applied]);
  useEffect(() => {
    if (search !== canonical) setParams(canonical, { replace: true });
  }, [search, canonical, setParams]);
  const reset = () => { setYear(""); setParams({}); };

  return (
    <PageShell eyebrow="Vozes da comunidade" title="Experiências que atravessam gerações." description="Memórias, aprendizados e novos caminhos, contados pelos próprios egressos. Leia os relatos e conheça as pessoas por trás de cada história."
      actions={<CopyLink key={path} path={path} />}>
      <form className={styles.toolbar} onSubmit={event => { event.preventDefault(); const value = depoimentoYear(year); setParams(value ? { ano: value } : {}); }}>
        <Field label="Ano de publicação" name="ano" type="number" min={1900} max={2100} step={1} placeholder="Ex.: 2024" value={year} onChange={event => setYear(event.target.value)} hint="Deixe em branco para ler todos os anos." />
        <div className={styles.actions}><Button type="submit">Buscar depoimentos</Button><Button variant="secondary" onClick={reset}>Mostrar todos</Button></div>
      </form>
      <div className={styles.heading}>
        <div><h2>{applied ? `Relatos publicados em ${applied}` : "Memórias compartilhadas"}</h2><p>Do mais recente ao mais antigo. Expanda os textos longos para continuar a leitura.</p></div>
        <p className={styles.count} role="status">{loading ? "Buscando depoimentos…" : error ? "Consulta indisponível" : `${items.length} ${items.length === 1 ? "depoimento encontrado" : "depoimentos encontrados"}`}</p>
      </div>
      {loading ? <LoadingState label="Carregando os relatos da comunidade…" /> : error ? <ErrorState description={error} onRetry={retry} /> : !items.length ? (
        <EmptyState title={applied ? `Nenhum depoimento publicado em ${applied}` : "As primeiras memórias ainda serão compartilhadas"} description={applied ? "Experimente outro ano ou consulte todos os depoimentos." : "Os relatos aparecerão aqui quando forem registrados pelos egressos em seus perfis."} action={applied ? <Button variant="secondary" onClick={reset}>Consultar todos os anos</Button> : undefined} />
      ) : <div className={styles.grid}>{items.map(item => <DepoimentoCard key={item.id_depoimento} depoimento={item} headingLevel={3} />)}</div>}
    </PageShell>
  );
}
