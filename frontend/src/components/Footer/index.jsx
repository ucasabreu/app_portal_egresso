import { Link } from "react-router-dom";
import { useAuth, accountPath } from "../../auth/AuthContext.js";
import Logo from "../../assets/ufmalogo.png";
import Container from "../ui/Container";
import styles from "./Footer.module.css";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.identity}>
            <Link to="/" className={styles.brand}><img src={Logo} alt="UFMA" width={1080} height={1080} decoding="async" /><span>Portal de Egressos</span></Link>
            <p>Formação que conecta. Histórias que inspiram.</p>
            <p className={styles.institution}>Comunidade de egressos da Universidade Federal do Maranhão.</p>
          </div>
          <nav className={styles.navigation} aria-label="Links do rodapé">
            <div className={styles.group}><h2>Explore o portal</h2><Link to="/egressos/listar">Comunidade</Link><Link to="/destaques">Histórias e conquistas</Link><Link to="/egressos/depoimentos">Depoimentos</Link></div>
            <div className={styles.group}><h2>Faça parte</h2><Link to="/edit-egresso">Cadastrar meu perfil</Link><Link to={accountPath(user)}>{user ? "Minha área" : "Entrar na minha conta"}</Link><Link to="/proposta">Conheça a proposta</Link></div>
          </nav>
        </div>
        <div className={styles.bottom}><p>© {new Date().getFullYear()} Portal de Egressos</p><p>Uma comunidade além da graduação.</p></div>
      </Container>
    </footer>
  );
}
