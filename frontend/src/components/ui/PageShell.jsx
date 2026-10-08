import Container from "./Container";
import PageBanner from "./PageBanner";
import Network from "../../assets/network.jpg";
import styles from "./PageShell.module.css";

export default function PageShell({ eyebrow = "Comunidade de egressos", title, description, actions, children, narrow = false }) {
  return <Container as="section" narrow={narrow} className={styles.page}>
    <PageBanner eyebrow={eyebrow} title={title} description={description} actions={actions} variant="compact" image={Network} />
    {children}
  </Container>;
}
