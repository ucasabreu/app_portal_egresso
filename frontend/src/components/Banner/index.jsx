import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Graduation from "../../assets/graduation.jpg";
import Container from "../ui/Container";
import styles from "./Banner.module.css";

export default function Banner() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Sua história continua aqui</p>
          <h1 id="home-title">A formação conecta.<br /><span>As histórias inspiram.</span></h1>
          <p className={styles.description}>Um espaço para reencontrar a comunidade, compartilhar conquistas e acompanhar as trajetórias de quem passou pela universidade.</p>
          <div className={styles.actions}>
            <Link to="/egressos/listar" className={styles.primary}>Conhecer os egressos <FaArrowRight aria-hidden="true" /></Link>
            <Link to="/proposta" className={styles.secondary}>Descobrir o portal</Link>
          </div>
          <p className={styles.note}>Formação · Comunidade · Trajetória</p>
        </div>
        <div className={styles.visual}>
          <img src={Graduation} alt="Formandos reunidos na celebração da graduação" loading="eager" />
          <div className={styles.caption}><span>Além do diploma</span><p>Novos caminhos.<br />O mesmo vínculo.</p></div>
        </div>
      </Container>
    </section>
  );
}
