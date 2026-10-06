import { FaSearch } from "react-icons/fa";
import styles from "./FeedbackState.module.css";

export default function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Experimente ajustar os filtros para encontrar o que procura.",
  action,
}) {
  return (
    <div className={styles.state}>
      <span className={styles.icon} aria-hidden="true"><FaSearch /></span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action}
    </div>
  );
}
