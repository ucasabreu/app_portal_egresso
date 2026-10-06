import { Link, useParams } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import { groupDestaques, orderedDestaques } from "../../utils/destaques.js";
import PageShell from "../../components/ui/PageShell";
import Photo from "../../components/ui/Photo";
import DestaqueCard from "../../components/ui/DestaqueCard";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import styles from "./Editorial.module.css";

export default function EgressoDestaque() {
  const { id } = useParams();
  const { data, loading, error, retry } = useCollection("/api/coordenadores/destaque/egresso/" + id);
  const ordered = orderedDestaques(data);
  const egresso = ordered[0]?.egresso;
  const groups = groupDestaques(ordered);
  return (
    <PageShell eyebrow="Uma trajetória em movimento" title={egresso ? "Conquistas de " + egresso.nome : "Histórico de destaques"} description="Acompanhe os momentos e os feitos reconhecidos pela comunidade."
      actions={<><Link to="/destaques" className={styles.link}>← Voltar aos destaques</Link><Link to={"/egresso_view/" + id} className={styles.link}>Conhecer perfil →</Link></>}>
      {loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={retry} /> : data.length === 0 ? <EmptyState title="Ainda não há destaques nesta trajetória" description="Os destaques publicados pela coordenação aparecerão aqui." /> : (
        <>
          <div className={styles.historyIntro}><Photo src={egresso?.foto} alt="" /><div><Link className={styles.link} to={"/egresso_view/" + id}>{egresso?.nome || "Conhecer esta trajetória"}</Link><p>{ordered.length} {ordered.length === 1 ? "conquista publicada" : "conquistas publicadas"}. Explore os momentos de cada ano.</p></div></div>
          {groups.map(group => <section className={styles.yearGroup} key={group.year} aria-label={"Conquistas: " + group.year}>
            <h2>{group.year}</h2><div className={styles.grid}>{group.destaques.map(item => <DestaqueCard key={item.id} destaque={item} headingLevel={3} expandable />)}</div>
          </section>)}
        </>
      )}
    </PageShell>
  );
}
