import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import useDestaque from "../../hooks/useDestaque";
import Container from "../../components/ui/Container";
import PageShell from "../../components/ui/PageShell";
import Photo from "../../components/ui/Photo";
import CopyLink from "../../components/ui/CopyLink";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import { formatDate } from "../../utils/presentation.js";
import styles from "./Editorial.module.css";

export default function DestaquePublicacao() {
  const { id } = useParams();
  const { state } = useLocation();
  const { data, loading, error, notFound, retry } = useDestaque(id);
  const gallery = typeof state?.gallery === "string" && /^\/destaques(?:\?|$)/.test(state.gallery) ? state.gallery : "/destaques";
  if (loading || error) return (
    <PageShell eyebrow="Conquistas da comunidade" title={loading ? "Conheça esta conquista." : notFound ? "Esta publicação não foi encontrada." : "Não foi possível abrir esta história."}
      actions={<Link to={gallery} className={styles.link}><FaArrowLeft aria-hidden="true" />Voltar aos destaques</Link>}>
      {loading ? <LoadingState label="Carregando publicação…" /> : <ErrorState title={notFound ? "Publicação não encontrada" : "Não foi possível carregar a publicação"} description={error} onRetry={notFound ? undefined : retry} />}
    </PageShell>
  );
  const egresso = data.egresso;
  return (
    <Container as="article" className={styles.article} aria-labelledby="publication-title">
      <nav aria-label="Caminho da publicação" className={styles.breadcrumb}><Link to="/">Início</Link><span aria-hidden="true">/</span><Link to={gallery}>Destaques</Link><span aria-hidden="true">/</span><span aria-current="page">Publicação</span></nav>
      <header className={styles.articleHeader}>
        <p className={styles.eyebrow}>Uma conquista da nossa comunidade</p>
        <h1 id="publication-title">{data.titulo || "Uma conquista para compartilhar"}</h1>
        <div className={styles.publicationMeta}><span>{egresso?.nome || "Comunidade de egressos"}</span><time dateTime={data.dataPublicacao || undefined}>{formatDate(data.dataPublicacao)}</time></div>
        {data.feitoDestaque && <p className={styles.lead}>{data.feitoDestaque}</p>}
      </header>
      <div className={styles.articleLayout}>
        <div className={styles.articleBody}>
          <Photo src={data.imagem || egresso?.foto} alt="" loading="eager" className={styles.articleImage} />
          <section className={styles.story} aria-labelledby="story-title"><h2 id="story-title">Sobre esta conquista</h2>
            <p>{data.noticia || "O texto desta publicação ainda não foi informado."}</p>
          </section>
          <Link to={gallery} className={styles.link}><FaArrowLeft aria-hidden="true" />Continuar explorando os destaques</Link>
        </div>
        <aside className={styles.author} aria-label="Egresso desta publicação">
          <Photo src={egresso?.foto} alt="" className={styles.authorPhoto} />
          <p className={styles.eyebrow}>Por trás desta história</p><h2>{egresso?.nome || "Comunidade de egressos"}</h2>
          <p>Conheça a formação, as experiências e outros momentos desta trajetória.</p>
          {egresso?.id_egresso != null && <div className={styles.authorLinks}>
            <Link to={"/egresso_view/" + egresso.id_egresso} className={styles.link}>Conhecer trajetória <FaArrowRight aria-hidden="true" /></Link>
            <Link to={"/egresso/" + egresso.id_egresso + "/destaques"} className={styles.link}>Histórico de conquistas <FaArrowRight aria-hidden="true" /></Link>
          </div>}
          <div className={styles.share}><h3>Compartilhe esta conquista</h3><CopyLink key={id} path={"/destaques/" + id} /></div>
        </aside>
      </div>
    </Container>
  );
}
