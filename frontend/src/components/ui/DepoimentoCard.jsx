import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaQuoteLeft } from "react-icons/fa";
import Photo from "./Photo";
import Button from "../Button/Button";
import { formatDate } from "../../utils/presentation.js";
import { depoimentoExcerpt } from "../../utils/depoimentos.js";
import styles from "./DepoimentoCard.module.css";

export default function DepoimentoCard({ depoimento, headingLevel = 2 }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const authorId = useId();
  const Heading = "h" + headingLevel;
  const excerpt = depoimentoExcerpt(depoimento.texto);
  const author = depoimento.egresso;
  const name = author?.nome || "Egresso da comunidade";
  const hasDate = depoimento.data && !Number.isNaN(Date.parse(depoimento.data));

  return (
    <article className={styles.card} aria-labelledby={authorId}>
      <FaQuoteLeft className={styles.icon} aria-hidden="true" />
      <blockquote id={contentId} className={styles.quote}>{(expanded ? excerpt.text : excerpt.preview) || "Este depoimento não possui texto cadastrado."}</blockquote>
      {excerpt.truncated && <Button className={styles.expand} variant="secondary" aria-expanded={expanded} aria-controls={contentId} aria-label={`${expanded ? "Recolher" : "Ler"} depoimento de ${name}`} onClick={() => setExpanded(value => !value)}>{expanded ? "Ler menos" : "Ler mais"}</Button>}
      <footer className={styles.footer}>
        <div className={styles.person}>
          <Photo src={author?.foto} alt="" width={48} height={48} className={styles.avatar} />
          <div><Heading id={authorId} className={styles.name}>{name}</Heading>{hasDate ? <time className={styles.date} dateTime={depoimento.data}>{formatDate(depoimento.data)}</time> : <p className={styles.date}>Data não informada</p>}</div>
        </div>
        {author?.id_egresso != null && <Link to={"/egresso_view/" + author.id_egresso} className={styles.link} aria-label={"Conhecer o perfil de " + name}>Conhecer o perfil <FaArrowRight aria-hidden="true" /></Link>}
      </footer>
    </article>
  );
}
