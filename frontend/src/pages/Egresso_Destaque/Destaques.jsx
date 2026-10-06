import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import PageShell from "../../components/ui/PageShell";
import Field from "../../components/ui/Field";
import DestaqueCard from "../../components/ui/DestaqueCard";
import Select from "../../components/ui/Select";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import { orderedDestaques } from "../../utils/destaques.js";
import styles from "./Editorial.module.css";

export default function Destaques() {
  const [params, setParams] = useSearchParams();
  const applied = params.get("busca") || "";
  const order = params.get("ordem") === "antigos" ? "antigos" : "recentes";
  const [search, setSearch] = useState(applied);
  useEffect(() => { setSearch(applied); }, [applied]);
  const { data, loading, error, retry } = useCollection("/api/coordenadores/destaque/listar" + (applied ? "?nome=" + encodeURIComponent(applied) : ""));
  const ordered = orderedDestaques(data, order);
  const changeSearch = event => {
    event.preventDefault();
    setParams(value => {
      const next = new URLSearchParams(value);
      if (search.trim()) next.set("busca", search.trim()); else next.delete("busca");
      return next;
    });
  };
  return (
    <PageShell eyebrow="Reconhecimento e conquistas" title="Histórias que inspiram novos caminhos." description="Conheça os feitos e os destaques registrados pela coordenação para a comunidade de egressos.">
      <form className={styles.filters} onSubmit={changeSearch}>
        <Field label="Nome do egresso ou curso" name="busca" type="search" placeholder="Ex.: Ana ou Ciência da Computação" value={search} onChange={event => setSearch(event.target.value)} />
        <Button type="submit">Buscar destaques</Button>
        <Button variant="secondary" onClick={() => { setSearch(""); setParams(value => { const next = new URLSearchParams(value); next.delete("busca"); return next; }); }}>Limpar busca</Button>
        <Field as={Select} label="Ordenar publicações" value={order} onChange={event => { const next = new URLSearchParams(params); next.set("ordem", event.target.value); setParams(next); }}>
          <option value="recentes">Mais recentes</option><option value="antigos">Mais antigas</option>
        </Field>
      </form>
      {loading ? <LoadingState label="Buscando histórias da comunidade…" /> : error ? <ErrorState description={error} onRetry={retry} /> : (
        <>
          <p className={styles.count} role="status">{ordered.length} {ordered.length === 1 ? "publicação encontrada" : "publicações encontradas"}{applied && <> para <strong>“{applied}”</strong></>}</p>
          {ordered.length === 0 ? <EmptyState title={applied ? "Nenhuma história encontrada nesta busca" : "As próximas conquistas aparecerão aqui"} description={applied ? "Experimente outro nome ou curso, ou limpe a busca para explorar as publicações." : "Quando a coordenação publicar um destaque, ele fará parte desta galeria."} /> : (
            <div className={styles.gallery}>
              <DestaqueCard destaque={ordered[0]} featured />
              {ordered.length > 1 && <div className={styles.grid}>{ordered.slice(1).map(item => <DestaqueCard key={item.id} destaque={item} />)}</div>}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
