import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import useCollection from "../../hooks/useCollection";
import PageShell from "../../components/ui/PageShell";
import Field from "../../components/ui/Field";
import Photo from "../../components/ui/Photo";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import Graduation from "../../assets/graduation.jpg";
import styles from "../../styles/Content.module.css";

export default function Destaques() {
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const { data, loading, error, retry } = useCollection("/api/coordenadores/destaque/listar" + (applied ? "?nome=" + encodeURIComponent(applied) : ""));
  return (
    <PageShell eyebrow="Reconhecimento e conquistas" title="Histórias que inspiram novos caminhos." description="Conheça os feitos e os destaques registrados pela coordenação para a comunidade de egressos.">
      <form className={styles.toolbar} onSubmit={event => { event.preventDefault(); setApplied(search.trim()); }}>
        <Field label="Nome do egresso" placeholder="Quem você quer conhecer?" value={search} onChange={event => setSearch(event.target.value)} />
        <Button type="submit">Buscar destaques</Button>
        <Button variant="secondary" onClick={() => { setSearch(""); setApplied(""); }}>Mostrar todos</Button>
      </form>
      {loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={retry} /> : data.length === 0 ? <EmptyState title="Nenhum destaque encontrado" description="Experimente outro nome. Novos destaques serão apresentados aqui quando publicados." /> : (
        <div className={styles.grid}>
          {data.map(item => (
            <article className={styles.card} key={item.id}>
              <Photo src={item.imagem || item.egresso?.foto} fallback={Graduation} alt="" className={styles.image} />
              <div className={styles.body}><span className={styles.tag}>Egresso em destaque</span><h2>{item.titulo}</h2>
                <p className={styles.meta}>{item.egresso?.nome || "Comunidade de egressos"}</p><p>{item.feitoDestaque || item.noticia}</p>
                {item.egresso?.id_egresso && <Link className={styles.link} to={"/egresso/" + item.egresso.id_egresso + "/destaques"}>Ver linha do tempo <FaArrowRight aria-hidden="true" /></Link>}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
