import styles from "./FeedbackState.module.css";

export default function LoadingState({ label = "Carregando…", className = "" }) {
  return (
    <div role="status" className={[styles.state, className].join(" ")}>
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.description}>{label}</p>
    </div>
  );
}
