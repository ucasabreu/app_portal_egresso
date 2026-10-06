import { Link, useLocation } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Photo from "./Photo";
import { formatDate } from "../../utils/presentation.js";
import styles from "./DestaqueCard.module.css";

export default function DestaqueCard({ destaque, featured = false, headingLevel = 2, expandable = false }) {
  const location = useLocation();
  const state = { gallery: location.pathname === "/destaques" ? location.pathname + location.search : "/destaques" };
  const Heading = "h" + headingLevel;
  const path = "/destaques/" + destaque.id;
  return (
    <article className={[styles.card, featured ? styles.featured : ""].join(" ")}>
      <Photo src={destaque.imagem || destaque.egresso?.foto} alt="" className={styles.cover} width={800} height={450} loading={featured ? "eager" : "lazy"} />
      <div className={styles.body}>
        <div className={styles.meta}><span>{featured ? "História em evidência" : "Conquista da comunidade"}</span><time dateTime={destaque.dataPublicacao || undefined}>{formatDate(destaque.dataPublicacao)}</time></div>
        <Heading className={styles.title}><Link to={path} state={state}>{destaque.titulo || "Uma conquista para compartilhar"}</Link></Heading>
        <p className={styles.summary}>{destaque.feitoDestaque || destaque.noticia || "Conheça esta história da comunidade de egressos."}</p>
        {expandable && destaque.noticia && <details className={styles.excerpt}><summary>Ler notícia nesta página</summary><p>{destaque.noticia}</p></details>}
        <div className={styles.footer}>
          <div className={styles.person}><Photo src={destaque.egresso?.foto} alt="" className={styles.avatar} width={32} height={32} /><span>{destaque.egresso?.nome || "Comunidade de egressos"}</span></div>
          <Link className={styles.read} to={path} state={state} aria-label={"Ler conquista: " + (destaque.titulo || "Publicação da comunidade")}>Ler conquista <FaArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}
