import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Photo from "./Photo";
import { cardFormation, cardExperience } from "../../utils/egressoDirectory.js";
import styles from "./EgressoCard.module.css";

export default function EgressoCard({ egresso, details, loading, directory, headingLevel = 2 }) {
  const Heading = "h" + headingLevel;
  const formation = cardFormation(details?.cursos);
  const experience = cardExperience(details?.cargos);
  return (
    <article className={styles.card}>
      <Photo src={egresso.foto} alt="" width={480} height={360} className={styles.cover} />
      <div className={styles.body}>
        <Heading className={styles.name}>{egresso.nome || "Egresso"}</Heading>
        <p className={styles.formation}>{loading ? "Carregando formação…" : details?.errors?.cursos ? "Formação indisponível" : formation ? <>{formation.curso.nome}{formation.curso.nivel && <span>{formation.curso.nivel}</span>}</> : "Formação não informada"}</p>
        <p className={styles.activity}>{loading ? "Carregando experiência…" : details?.errors?.cargos ? "Experiência indisponível" : experience ? <>{experience.descricao}{experience.local && <span> · {experience.local}</span>}</> : egresso.descricao || "Conheça esta trajetória."}</p>
        <Link to={"/egresso_view/" + egresso.id_egresso} state={{ directory }} className={styles.link} aria-label={"Ver perfil de " + (egresso.nome || "egresso")}>Ver perfil <FaArrowRight aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
