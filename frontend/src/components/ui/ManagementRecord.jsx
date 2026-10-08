import { FaCheck, FaEllipsisV, FaPencilAlt } from "react-icons/fa";
import Photo from "./Photo";
import { formatDate } from "../../utils/presentation.js";
import styles from "./ManagementRecord.module.css";

export default function ManagementRecord({ item, draft = false, children }) {
  return <article className={styles.record}>
    <Photo src={item.imagem || item.egresso?.foto} alt="" width={160} height={120} className={styles.cover} />
    <div className={styles.body}><h3>{item.titulo || (draft ? "Destaque sem título" : "Conquista da comunidade")}</h3><p>{item.egresso?.nome || "Egresso não informado"}<span aria-hidden="true"> · </span>{formatDate(draft ? item.atualizadoEm : item.dataPublicacao)}</p></div>
    <span className={draft ? styles.draft : styles.published}>{draft ? <FaPencilAlt aria-hidden="true" /> : <FaCheck aria-hidden="true" />}{draft ? "Rascunho privado" : "Publicado"}</span>
    <details className={styles.menu} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
      <summary aria-label={"Ações de " + (item.titulo || "destaque sem título")}><FaEllipsisV aria-hidden="true" /></summary>
      <div className={styles.actions} onClick={event => { if (event.target.closest("button, a")) { const menu = event.currentTarget.parentElement; menu.open = false; menu.querySelector("summary")?.focus(); } }}>{children}</div>
    </details>
  </article>;
}
