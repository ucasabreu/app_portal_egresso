import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Graduation from "../../assets/graduation.jpg";
import Container from "../ui/Container";
import PageBanner from "../ui/PageBanner";
import styles from "./Banner.module.css";

export default function Banner({ statistics = [] }) {
  return <section aria-labelledby="home-title"><Container>
    <PageBanner variant="home" titleId="home-title" eyebrow="Universidade Federal do Maranhão" title={<>A formação conecta.<br />As histórias inspiram.</>}
      description="Um espaço para acompanhar e valorizar as trajetórias de quem passou pela universidade. Reencontre pessoas, descubra conquistas e compartilhe sua história."
      image={Graduation} imageAlt="Formandos reunidos na celebração da graduação" caption={<>Além do diploma,<br />um vínculo para a vida.</>}
      actions={<><Link to="/egressos/listar" className={styles.primary}>Explorar a comunidade <FaArrowRight aria-hidden="true" /></Link><Link to="/edit-egresso" className={styles.secondary}>Cadastrar meu perfil</Link></>}>
      {statistics.length > 0 && <dl className={styles.statistics} aria-label="A comunidade em números">{statistics.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value.toLocaleString("pt-BR")}</dd></div>)}</dl>}
    </PageBanner>
  </Container></section>;
}
