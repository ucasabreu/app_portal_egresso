import { FaEnvelope, FaLinkedin, FaInstagram, FaFileAlt } from "react-icons/fa";
import Photo from "./Photo";
import CopyLink from "./CopyLink";
import styles from "./ProfileHero.module.css";

export default function ProfileHero({ egresso, cursos }) {
  const links = [[egresso.linkedin, FaLinkedin, "LinkedIn"], [egresso.instagram, FaInstagram, "Instagram"], [egresso.curriculo, FaFileAlt, "Currículo"]];
  const courseNames = [...new Set(cursos.map(item => item.curso?.nome).filter(Boolean))].slice(0, 2);
  return (
    <header className={styles.hero}>
      <div className={styles.identity}>
        <Photo src={egresso.foto} alt="" loading="eager" className={styles.photo} />
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Pessoas que fazem parte da nossa história</p>
          <h1>{egresso.nome}</h1>
          {courseNames.length > 0 && <ul className={styles.courses} aria-label="Formações registradas">{courseNames.map(name => <li key={name}>{name}</li>)}</ul>}
          <p className={styles.description}>{egresso.descricao || "Conheça os caminhos de formação, trabalho e conquistas deste egresso."}</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.contacts}>
          {egresso.email && <a href={"mailto:" + egresso.email}><FaEnvelope aria-hidden="true" />{egresso.email}</a>}
          {links.filter(([url]) => url).map(([url, icon, label]) => {
            const Icon = icon;
            return <a href={url} key={label} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" />{label}<span aria-hidden="true">↗</span></a>;
          })}
        </div>
        <CopyLink key={egresso.id_egresso} path={"/egresso_view/" + egresso.id_egresso} />
      </div>
    </header>
  );
}
