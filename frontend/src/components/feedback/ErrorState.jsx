import { FaExclamationCircle } from "react-icons/fa";
import Button from "../Button/Button";
import styles from "./FeedbackState.module.css";

export default function ErrorState({
  title = "Não foi possível carregar as informações",
  description = "Tente novamente em alguns instantes.",
  onRetry,
}) {
  return (
    <div role="alert" className={styles.state}>
      <span className={[styles.icon, styles.error].join(" ")} aria-hidden="true">
        <FaExclamationCircle />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Tentar novamente</Button>}
    </div>
  );
}
