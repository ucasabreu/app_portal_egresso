import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaQuoteLeft } from "react-icons/fa";
import useCollection from "../../hooks/useCollection";
import { formatDate } from "../../utils/presentation";
import PageShell from "../../components/ui/PageShell";
import Photo from "../../components/ui/Photo";
import Field from "../../components/ui/Field";
import Button from "../../components/Button/Button";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import styles from "../../styles/Content.module.css";

export default function Depoimento() {
  const [year, setYear] = useState("");
  const [applied, setApplied] = useState("");
  const { data, loading, error, retry } = useCollection("/api/consultas/listar/depoimentos" + (applied ? "/ano?ano=" + encodeURIComponent(applied) : ""));
  return (
    <PageShell eyebrow="Vozes da comunidade" title="Experiências que atravessam gerações." description="Memórias, aprendizados e novos caminhos, contados pelos próprios egressos.">
      <form className={styles.toolbar} onSubmit={event => { event.preventDefault(); setApplied(year); }}>
        <Field label="Ano de publicação" type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="Ex.: 2024" value={year} onChange={event => setYear(event.target.value)} />
        <Button type="submit">Buscar depoimentos</Button>
        <Button variant="secondary" onClick={() => { setYear(""); setApplied(""); }}>Mostrar todos</Button>
      </form>
      {loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={retry} /> : data.length === 0 ? <EmptyState title="Nenhum depoimento publicado neste período" description="Experimente outro ano ou consulte todos os depoimentos." /> : (
        <div className={styles.grid}>
          {data.map(item => (
            <article className={styles.card} key={item.id_depoimento}>
              <div className={styles.body}>
                <FaQuoteLeft className={styles.quoteIcon} aria-hidden="true" />
                <blockquote className={styles.quote}>{item.texto}</blockquote>
                <div className={styles.person}><Photo src={item.egresso?.foto} alt="" className={styles.avatar} /><div><h2>{item.egresso?.nome || "Egresso da comunidade"}</h2><p className={styles.meta}>{formatDate(item.data)}</p></div></div>
                {item.egresso?.id_egresso && <Link className={styles.link} to={"/egresso_view/" + item.egresso.id_egresso}>Conhecer o perfil <FaArrowRight aria-hidden="true" /></Link>}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
