import { Link } from "react-router-dom";
import { FaHome, FaUserCircle, FaEnvelope, FaLinkedin, FaInstagram, FaFileAlt, FaCamera, FaPen, FaBriefcase, FaGraduationCap, FaQuoteLeft, FaSeedling, FaInfoCircle, FaArrowRight } from "react-icons/fa";
import Photo from "./Photo";
import ProfileNavigation from "./ProfileNavigation";
import LogoutButton from "./LogoutButton";
import ErrorState from "../feedback/ErrorState";
import { formatDate } from "../../utils/presentation";
import { cardFormation, cardExperience, orderedTrajectory, trajectoryPeriod } from "../../utils/egressoDirectory.js";
import PublicTrajectory from "./PublicTrajectory";
import styles from "./ProfileDetails.module.css";

const workspaceLinks = [["workspace-overview", "Visão geral", FaHome], ["profile-personal", "Informações pessoais", FaUserCircle], ["profile-about", "Sobre minha trajetória", FaFileAlt], ["profile-experience", "Caminhos de atuação", FaBriefcase], ["profile-education", "Cursos e aprendizado", FaGraduationCap], ["profile-testimonials", "Meus depoimentos", FaQuoteLeft]];
const externalLink = (url, label, icon) => {
  const Icon = icon;
  return <a href={url} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" />{label}<span className={styles.srOnly}> (abre em nova aba)</span><FaArrowRight aria-hidden="true" /></a>;
};
const isForm = action => action?.type === "form";

export default function ProfileDetails({ egresso, cargos = [], cursos = [], depoimentos = [], destaques = [], sections = {}, reload, publicView = false, cargoAction, cursoAction, depoimentoAction, renderDelete }) {
  if (publicView) return <PublicTrajectory egresso={egresso} cargos={cargos} cursos={cursos} depoimentos={depoimentos} destaques={destaques} sections={sections} reload={reload} />;
  const editPath = "/edit-egresso/" + egresso.id_egresso;
  const formation = !sections.cursos && cardFormation(cursos);
  const experience = !sections.cargos && cardExperience(cargos);
  const education = orderedTrajectory(cursos).sort((a, b) => (b.ano_inicio || 0) - (a.ano_inicio || 0));
  const employment = orderedTrajectory(cargos).sort((a, b) => (b.ano_inicio || 0) - (a.ano_inicio || 0));
  const contacts = [[egresso.linkedin, FaLinkedin, "LinkedIn"], [egresso.instagram, FaInstagram, "Instagram"], [egresso.curriculo, FaFileAlt, "Currículo"]].filter(([url]) => url);
  const editLink = label => <Link className={styles.editLink} to={editPath}><FaPen aria-hidden="true" />{label}</Link>;
  return <div className={styles.layout}>
    <aside className={styles.identity} aria-label="Identificação e navegação do meu espaço">
      <div className={styles.sidebarContent}>
        <div className={styles.identityHeader}>
          <Photo src={egresso.foto} alt={egresso.nome} className={styles.photo} width={240} height={300} />
          <Link className={styles.photoAction} to={editPath}><FaCamera aria-hidden="true" />Alterar foto</Link>
          <h2>{egresso.nome || "Meu perfil"}</h2>
          {formation && <p className={styles.formation}>{formation.curso.nome}</p>}
          {experience && <p className={styles.activity}><FaBriefcase aria-hidden="true" />{experience.descricao}</p>}
        </div>
        <ProfileNavigation items={workspaceLinks} variant="sidebar" label="Seções do meu espaço" />
      </div>
      <div className={styles.accountActions}>{editLink("Editar dados e contatos")}<LogoutButton /></div>
    </aside>
    <div className={styles.sections}>
      <section id="workspace-overview" className={styles.welcome} aria-labelledby="workspace-welcome-title"><FaSeedling aria-hidden="true" /><div><h2 id="workspace-welcome-title">Seu perfil, sempre em movimento</h2><p>Atualize suas experiências e compartilhe o que aprendeu.</p></div></section>
      <section id="profile-personal" className={styles.panel} aria-labelledby="personal-title">
        <div className={styles.sectionHeading}><h2 id="personal-title">Informações pessoais</h2>{editLink("Editar informações")}</div>
        <dl className={styles.personalGrid}>
          <div><dt>Nome completo</dt><dd>{egresso.nome || "Nome não informado"}</dd></div>
          <div><dt>E-mail de contato</dt><dd>{egresso.email ? <a href={"mailto:" + egresso.email}><FaEnvelope aria-hidden="true" />{egresso.email}</a> : "E-mail não informado"}</dd></div>
          {contacts.map(([url, Icon, label]) => <div key={label}><dt>{label}</dt><dd>{externalLink(url, label === "Currículo" ? "Ver currículo" : "Abrir " + label, Icon)}</dd></div>)}
        </dl>
        <p className={styles.visibility}><FaInfoCircle aria-hidden="true" />Estes dados e contatos aparecem no seu perfil público.</p>
      </section>
      <section id="profile-about" className={styles.panel} aria-labelledby="about-title">
        <div className={styles.sectionHeading}><h2 id="about-title">Sobre minha trajetória</h2>{editLink("Editar apresentação")}</div>
        <p className={styles.description}>{egresso.descricao || "Conte um pouco sobre sua trajetória, seus aprendizados e os caminhos que deseja compartilhar com a comunidade."}</p>
      </section>
      <section id="profile-experience" className={styles.panel} aria-labelledby="experience-title">
        <div className={styles.sectionHeading}><h2 id="experience-title"><FaBriefcase aria-hidden="true" />Caminhos de atuação</h2>{!isForm(cargoAction) && cargoAction}</div>
        {sections.cargos ? <ErrorState description={sections.cargos} onRetry={reload} /> : employment.length ? <ol className={styles.timeline}>{employment.map(item => <li key={item.id_cargo}>
          <div><h3>{item.descricao || "Experiência profissional"}</h3>{item.local && <p>{item.local}</p>}<p className={styles.period}>{trajectoryPeriod(item)}</p></div>
          {renderDelete?.("cargo", item.id_cargo)}
        </li>)}</ol> : <p className={styles.empty}>Adicione sua primeira experiência para apresentar os caminhos da sua atuação.</p>}
        {isForm(cargoAction) && <div className={styles.formArea}>{cargoAction}</div>}
      </section>
      <section id="profile-education" className={styles.panel} aria-labelledby="education-title">
        <div className={styles.sectionHeading}><h2 id="education-title"><FaGraduationCap aria-hidden="true" />Cursos e aprendizado</h2>{!isForm(cursoAction) && cursoAction}</div>
        {sections.cursos ? <ErrorState description={sections.cursos} onRetry={reload} /> : education.length ? <ul className={styles.records}>{education.map(item => <li key={item.id_curso_egresso}>
          <div><h3>{item.curso?.nome || "Curso"}</h3><p className={styles.educationMeta}>{item.curso?.nivel && <span className={styles.level}>{item.curso.nivel}</span>}<span className={styles.period}>{trajectoryPeriod(item)}</span></p></div>
          {renderDelete?.("curso", item.id_curso_egresso)}
        </li>)}</ul> : <p className={styles.empty}>Registre sua formação e os cursos que fazem parte da sua trajetória.</p>}
        {isForm(cursoAction) && <div className={styles.formArea}>{cursoAction}</div>}
      </section>
      <section id="profile-testimonials" className={[styles.panel, styles.testimonials].join(" ")} aria-labelledby="testimonials-title">
        <div className={styles.sectionHeading}><h2 id="testimonials-title">Meus depoimentos</h2>{!isForm(depoimentoAction) && depoimentoAction}</div>
        <p className={styles.sectionNote}><FaInfoCircle aria-hidden="true" />Os relatos publicados ficam visíveis à comunidade.</p>
        {sections.depoimentos ? <ErrorState description={sections.depoimentos} onRetry={reload} /> : depoimentos.length ? <ul className={styles.testimonialRecords}>{depoimentos.map(item => <li key={item.id_depoimento}>
          <div className={styles.quote}><FaQuoteLeft aria-hidden="true" /><blockquote>{item.texto}</blockquote></div>
          <div className={styles.recordFooter}><p>{formatDate(item.data)}</p>{renderDelete?.("depoimento", item.id_depoimento)}</div>
        </li>)}</ul> : <p className={styles.empty}>Compartilhe uma memória, um aprendizado ou uma experiência da sua passagem pela universidade.</p>}
        {isForm(depoimentoAction) && <div className={styles.formArea}>{depoimentoAction}</div>}
      </section>
    </div>
  </div>;
}
