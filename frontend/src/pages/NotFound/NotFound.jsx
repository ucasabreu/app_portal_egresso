import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Network from "../../assets/network.jpg";
import Container from "../../components/ui/Container";
import PageBanner from "../../components/ui/PageBanner";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return <Container className={styles.page}>
    <PageBanner titleId="not-found-title" breadcrumb={[{ label: "Início", to: "/" }, { label: "Página não encontrada" }]} eyebrow="404 · Página não encontrada" title="Vamos encontrar o caminho."
      description="O endereço acessado não corresponde a uma página do portal. Confira o link ou continue explorando a comunidade." image={Network}
      actions={<div className={styles.actions}><Link to="/">Voltar ao início <FaArrowRight aria-hidden="true" /></Link><Link to="/egressos/listar">Explorar a comunidade <FaArrowRight aria-hidden="true" /></Link></div>} />
  </Container>;
}
