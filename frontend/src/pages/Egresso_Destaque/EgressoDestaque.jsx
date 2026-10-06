import { Link, useParams } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import { formatDate } from "../../utils/presentation";
import PageShell from "../../components/ui/PageShell";
import Photo from "../../components/ui/Photo";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import styles from "../../styles/Content.module.css";

export default function EgressoDestaque() {
  const { id } = useParams();
  const { data, loading, error, retry } = useCollection("/api/coordenadores/destaque/egresso/" + id);
  const egresso = data[0]?.egresso;
  const ordered = [...data].sort((a, b) => (b.dataPublicacao || "").localeCompare(a.dataPublicacao || ""));
  return (
    <PageShell eyebrow="Uma trajetória em movimento" title={egresso ? "Conquistas de " + egresso.nome : "Histórico de destaques"} description="Acompanhe os momentos e os feitos reconhecidos pela comunidade."
      actions={<Link to="/destaques" className={styles.link}>← Voltar aos destaques</Link>}>
      {loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={retry} /> : data.length === 0 ? <EmptyState title="Ainda não há destaques nesta trajetória" description="Os destaques publicados pela coordenação aparecerão aqui." /> : (
        <>
          <div className={styles.profileIntro}><Photo src={egresso?.foto} alt="" className={styles.avatar} /><Link className={styles.link} to={"/egresso_view/" + id}>Conhecer o perfil de {egresso?.nome}</Link></div>
          <ol className={styles.timeline}>
            {ordered.map(item => (
              <li key={item.id} className={styles.event}>
                <time className={styles.tag} dateTime={item.dataPublicacao || undefined}>{formatDate(item.dataPublicacao)}</time>
                <h2>{item.titulo}</h2>
                {item.imagem && <Photo src={item.imagem} alt={item.titulo || ""} className={styles.image} />}
                <p>{item.noticia}</p>{item.feitoDestaque && <p><strong>Conquista:</strong> {item.feitoDestaque}</p>}
              </li>
            ))}
          </ol>
        </>
      )}
    </PageShell>
  );
}
