import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import PageShell from "../../components/ui/PageShell";
import Graduation from "../../assets/graduation.jpg";
import Network from "../../assets/network.jpg";
import Opportunity from "../../assets/opportunity.jpg";
import styles from "../../styles/Content.module.css";

const features = [
  { image: Graduation, title: "Valorizar a formação", text: "Reúna os cursos que fazem parte da sua história acadêmica e acompanhe os caminhos dos colegas de formação." },
  { image: Network, title: "Manter o vínculo", text: "Encontre egressos, leia depoimentos e compartilhe experiências que aproximam a universidade e sua comunidade." },
  { image: Opportunity, title: "Reconhecer trajetórias", text: "Apresente experiências profissionais e conheça as conquistas que a coordenação destaca no portal." },
];
export default function PropostaPortal() {
  return (
    <PageShell eyebrow="Conheça o portal" title="O vínculo com a universidade vai além do diploma." description="O Portal de Egressos reúne pessoas, experiências e conquistas em um espaço de memória e conexão com a comunidade acadêmica.">
      <div className={styles.grid}>
        {features.map((feature, index) => (
          <article key={feature.title} className={styles.card}>
            <img src={feature.image} alt="" className={styles.image} loading="lazy" />
            <div className={styles.body}><span className={styles.tag}>0{index + 1}</span><h2>{feature.title}</h2><p>{feature.text}</p></div>
          </article>
        ))}
      </div>
      <section className={styles.callout}><div><h2>Sua história faz parte desta comunidade.</h2><p>Crie seu perfil, registre sua formação e compartilhe as experiências que marcaram sua trajetória.</p></div><Link className={styles.link} style={{ color: "white" }} to="/edit-egresso">Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link></section>
    </PageShell>
  );
}
