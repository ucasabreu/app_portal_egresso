import Photo from "./Photo";
import styles from "./HighlightPreview.module.css";

export default function HighlightPreview({ values, egresso, compact = false }) {
  return (
    <article className={[styles.preview, compact ? styles.compact : ""].join(" ")} aria-label={compact ? "Prévia do cartão" : "Prévia da publicação"}>
      {values.imagem ? <Photo src={values.imagem} alt="" className={styles.image} width={800} height={450} /> : <div className={styles.placeholder}>Imagem não informada</div>}
      <div className={styles.body}>
        <p className={styles.label}>Prévia · ainda não publicada</p>
        <h3>{values.titulo || "Título da publicação"}</h3>
        <p className={styles.person}>{egresso.nome}</p>
        <p className={styles.achievement}>{values.feitoDestaque || "A conquista será apresentada aqui."}</p>
        <p className={styles.news}>{values.noticia || "O texto da notícia será apresentado aqui."}</p>
        <p className={styles.date}>A data será definida ao publicar.</p>
      </div>
    </article>
  );
}
