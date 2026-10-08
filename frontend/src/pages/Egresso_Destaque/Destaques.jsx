import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import usePagedCollection from "../../hooks/usePagedCollection.js";
import Container from "../../components/ui/Container";
import EditorialHeader from "../../components/ui/EditorialHeader";
import CopyLink from "../../components/ui/CopyLink";
import Field from "../../components/ui/Field";
import DestaqueCard from "../../components/ui/DestaqueCard";
import Select from "../../components/ui/Select";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import styles from "./Editorial.module.css";

export default function Destaques() {
  const [params, setParams] = useSearchParams();
  const applied = params.get("busca") || "";
  const order = params.get("ordem") === "antigos" ? "antigos" : "recentes";
  const requested = Number(params.get("pagina"));
  const page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  const [search, setSearch] = useState(applied);
  useEffect(() => { setSearch(applied); }, [applied]);
  const { data, loading, error, retry } = usePagedCollection("/api/publico/destaques?" + new URLSearchParams({ nome: applied, ordem: order, pagina: page, tamanho: 6 }));
  const ordered = data.items;
  const path = "/destaques" + (params.size ? "?" + params.toString() : "");
  const changePage = number => { const next = new URLSearchParams(params); if (number > 1) next.set("pagina", number); else next.delete("pagina"); setParams(next); };
  const clearSearch = () => { setSearch(""); setParams(value => { const next = new URLSearchParams(value); next.delete("busca"); next.delete("pagina"); return next; }); };
  const pageNumbers = [...new Set([1, data.page - 1, data.page, data.page + 1, data.pages])].filter(number => number >= 1 && number <= data.pages).sort((a, b) => a - b);
  useEffect(() => {
    if (!loading && !error && page !== data.page) {
      const next = new URLSearchParams(params); if (data.page > 1) next.set("pagina", data.page); else next.delete("pagina"); setParams(next, { replace: true });
    }
  }, [loading, error, page, data.page, params, setParams]);
  const changeSearch = event => {
    event.preventDefault();
    setParams(value => {
      const next = new URLSearchParams(value);
      if (search.trim()) next.set("busca", search.trim()); else next.delete("busca");
      next.delete("pagina"); return next;
    });
  };
  return (
    <Container className={styles.page}>
      <EditorialHeader breadcrumb={[{ label: "Início", to: "/" }, { label: "Histórias" }]} eyebrow="Reconhecimento e conquistas" title="Histórias que inspiram novos caminhos." description="Conheça os feitos e os destaques registrados pela coordenação para a comunidade de egressos." actions={<CopyLink key={path} path={path} />} />
      <form className={styles.filters} onSubmit={changeSearch} aria-label="Buscar e ordenar histórias">
        <Field label="Nome do egresso ou curso" name="busca" type="search" placeholder="Ex.: Ana ou Ciência da Computação" value={search} onChange={event => setSearch(event.target.value)} />
        <div className={styles.filterActions}><Button type="submit">Buscar destaques</Button><Button variant="secondary" onClick={clearSearch}>Limpar busca</Button></div>
        <Field as={Select} name="ordem" label="Ordenar publicações" value={order} onChange={event => { const next = new URLSearchParams(params); next.set("ordem", event.target.value); next.delete("pagina"); setParams(next); }}>
          <option value="recentes">Mais recentes</option><option value="antigos">Mais antigas</option>
        </Field>
      </form>
      <section aria-labelledby="gallery-title" aria-busy={loading}>
        <div className={styles.resultsHeading}><h2 id="gallery-title">{applied ? "Histórias da sua busca" : "Conquistas da comunidade"}</h2>
          <p className={styles.count} role="status">{loading ? "Buscando histórias…" : error ? "Consulta indisponível" : <>{data.total} {data.total === 1 ? "publicação encontrada" : "publicações encontradas"}{applied && <> para <strong>“{applied}”</strong></>}</>}</p>
        </div>
        {loading ? <LoadingState label="Buscando histórias da comunidade…" /> : error ? <ErrorState description={error} onRetry={retry} /> : ordered.length === 0 ? (
          <EmptyState title={applied ? "Nenhuma história encontrada nesta busca" : "As próximas conquistas aparecerão aqui"} description={applied ? "Experimente outro nome ou curso, ou limpe a busca para explorar as publicações." : "Quando a coordenação publicar um destaque, ele fará parte desta galeria."} action={applied ? <Button variant="secondary" onClick={clearSearch}>Explorar todas as histórias</Button> : undefined} />
        ) : <>
          <div className={styles.gallery}>
            <DestaqueCard destaque={ordered[0]} featured headingLevel={3} />
            {ordered.length > 1 && <div className={styles.grid}>{ordered.slice(1).map(item => <DestaqueCard key={item.id} destaque={item} headingLevel={3} />)}</div>}
          </div>
          {data.pages > 1 && <nav className={styles.pagination} aria-label="Páginas de histórias">
            <Button variant="secondary" disabled={data.page === 1} onClick={() => changePage(data.page - 1)}>Anterior</Button>
            {pageNumbers.map((number, index) => <Fragment key={number}>
              {index > 0 && number - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
              <Button variant="secondary" aria-label={"Página " + number} aria-current={number === data.page ? "page" : undefined} onClick={() => changePage(number)}>{number}</Button>
            </Fragment>)}
            <Button variant="secondary" disabled={data.page === data.pages} onClick={() => changePage(data.page + 1)}>Próxima</Button>
            <p>Página {data.page} de {data.pages}</p>
          </nav>}
        </>}
      </section>
    </Container>
  );
}
