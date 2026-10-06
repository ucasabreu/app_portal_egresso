import Container from "./Container";
import styles from "./PageShell.module.css";

export default function PageShell({ eyebrow = "Comunidade de egressos", title, description, actions, children, narrow = false }) {
  return (
    <Container as="section" narrow={narrow} className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {children}
    </Container>
  );
}
