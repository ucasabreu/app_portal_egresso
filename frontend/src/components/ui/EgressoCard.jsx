import { Link } from "react-router-dom";
import { FaArrowRight, FaGraduationCap, FaBriefcase } from "react-icons/fa";
import Photo from "./Photo";
import { cardFormation, cardExperience, trajectoryPeriod } from "../../utils/egressoDirectory.js";
import styles from "./EgressoCard.module.css";

export default function EgressoCard({ egresso, details, loading, directory, headingLevel = 2 }) {
  const Heading = "h" + headingLevel;
  const formation = cardFormation(details?.cursos);
  const experience = cardExperience(details?.cargos);
  const missing = section => loading ? "Carregando…" : details?.errors[section] ? "Informação indisponível" : "Não informada";
  return (
    <article className={styles.card}>
      <header className={styles.identity}>
        <Photo src={egresso.foto} alt="" width={80} height={80} className={styles.avatar} />
        <div><p className={styles.eyebrow}>Comunidade de egressos</p><Heading className={styles.name}>{egresso.nome || "Egresso"}</Heading></div>
      </header>
      <p className={styles.description}>{egresso.descricao || "Conheça a formação e as experiências deste egresso."}</p>
      <dl className={styles.details}>
        <div><dt><FaGraduationCap aria-hidden="true" />Formação</dt><dd>{formation ? <><strong>{formation.curso.nome}</strong><span>{trajectoryPeriod(formation)}</span></> : missing("cursos")}</dd></div>
        <div><dt><FaBriefcase aria-hidden="true" />Experiência profissional</dt><dd>{experience ? <><strong>{experience.descricao}</strong>{experience.local && <span>{experience.local}</span>}<span>{trajectoryPeriod(experience)}</span></> : missing("cargos")}</dd></div>
      </dl>
      <Link to={"/egresso_view/" + egresso.id_egresso} state={{ directory }} className={styles.link} aria-label={"Conhecer trajetória de " + (egresso.nome || "egresso")}>Conhecer trajetória <FaArrowRight aria-hidden="true" /></Link>
    </article>
  );
}
