import { Link } from "react-router-dom";
import Container from "../ui/Container";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div><Link to="/" className={styles.brand}>Portal de Egressos</Link><p>Formação que conecta. Histórias que inspiram.</p></div>
          <nav aria-label="Links do rodapé">
            <Link to="/proposta">O portal</Link><Link to="/egressos/listar">Comunidade</Link>
            <Link to="/edit-egresso">Participar</Link><Link to="/login">Coordenação</Link>
          </nav>
        </div>
        <div className={styles.bottom}><p>© {new Date().getFullYear()} Portal de Egressos</p><p>Uma comunidade além da graduação.</p></div>
      </Container>
    </footer>
  );
}
