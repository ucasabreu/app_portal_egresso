import { FaBriefcase, FaEnvelope, FaLinkedin, FaInstagram, FaRegFileAlt, FaQuoteLeft } from "react-icons/fa";
import { cardExperience, cardFormation } from "../../utils/egressoDirectory.js";
import Photo from "./Photo";
import CopyLink from "./CopyLink";
import styles from "./ProfileHero.module.css";

export default function ProfileHero({ egresso, cursos = [], cargos = [], depoimentos = [], sections = {} }) {
  const formation = !sections.cursos && cardFormation(cursos);
  const experience = !sections.cargos && cardExperience(cargos);
  const quote = !sections.depoimentos && depoimentos.find(item => item.texto?.trim());
  const socialLinks = [[egresso.linkedin, FaLinkedin, "LinkedIn"], [egresso.instagram, FaInstagram, "Instagram"]];
  return <header className={[styles.hero, quote ? styles.withQuote : ""].join(" ")}>
    <figure className={styles.portrait}>
      <Photo src={egresso.foto} alt="" loading="eager" className={styles.photo} width={320} height={400} />
      <figcaption>Perfil da comunidade</figcaption>
    </figure>
    <div className={styles.identity}>
      <p className={styles.eyebrow}>Trajetória profissional</p>
      <h1>{egresso.nome || "Egresso da comunidade"}</h1>
      {formation && <p className={styles.courses}>{formation.curso.nome}</p>}
      {experience && <p className={styles.activity}>{experience.descricao}</p>}
      {(experience?.local || egresso.email) && <div className={styles.details}>
        {experience?.local && <p className={styles.workplace}><FaBriefcase aria-hidden="true" />{experience.local}</p>}
        {egresso.email && <a className={styles.email} href={"mailto:" + egresso.email}><FaEnvelope aria-hidden="true" />{egresso.email}</a>}
      </div>}
      <div className={styles.actions}>
        {egresso.curriculo && <a href={egresso.curriculo} className={styles.curriculum} target="_blank" rel="noopener noreferrer"><FaRegFileAlt aria-hidden="true" />Ver currículo<span className={styles.srOnly}> (abre em nova aba)</span></a>}
        <div className={styles.share}><CopyLink key={egresso.id_egresso} path={"/egresso_view/" + egresso.id_egresso} /></div>
      </div>
      {socialLinks.some(([url]) => url) && <div className={styles.socialLinks}>
        {socialLinks.filter(([url]) => url).map(([url, icon, label]) => {
          const Icon = icon;
          return <a href={url} key={label} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" />{label}<span className={styles.srOnly}> (abre em nova aba)</span></a>;
        })}
      </div>}
    </div>
    {quote && <aside className={styles.quote} aria-label="Trecho do depoimento deste egresso">
      <FaQuoteLeft className={styles.quoteMark} aria-hidden="true" />
      <blockquote>{quote.texto}</blockquote>
      <p className={styles.quoteAuthor}>{egresso.nome || "Egresso da comunidade"}</p>
      <a href="#profile-testimonials">Ler depoimento completo</a>
    </aside>}
  </header>;
}
