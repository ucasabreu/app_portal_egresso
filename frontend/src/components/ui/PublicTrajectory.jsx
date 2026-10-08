import { Link } from "react-router-dom";
import { FaArrowRight, FaBriefcase, FaGraduationCap, FaMedal, FaRegComment, FaRegNewspaper, FaRegFileAlt, FaChartBar } from "react-icons/fa";
import { cardExperience, orderedTrajectory, trajectoryPeriod } from "../../utils/egressoDirectory.js";
import { formatDate } from "../../utils/presentation.js";
import ErrorState from "../feedback/ErrorState";
import Photo from "./Photo";
import styles from "./PublicTrajectory.module.css";

function Group({ id, title, icon, children }) {
  const Icon = icon;
  return <section id={id} className={styles.group}><header className={styles.groupLabel}><span><Icon aria-hidden="true" /></span><h3>{title}</h3></header><div className={styles.groupBody}>{children}</div></section>;
}
export default function PublicTrajectory({ egresso, cargos = [], cursos = [], depoimentos = [], destaques = [], sections = {}, reload }) {
  const experience = !sections.cargos && cardExperience(cargos);
  const pathways = experience ? [experience, ...cargos].filter((item, index, items) => item?.descricao?.trim() && items.findIndex(other => other?.descricao?.trim() === item.descricao.trim()) === index).slice(0, 3) : [];
  const featured = !sections.destaques && destaques.find(item => item.id != null);
  return <div className={styles.profile}>
    <div className={styles.presentation}>
      <div><section id="profile-about" className={styles.about} aria-labelledby="profile-about-title">
        <h2 id="profile-about-title">Sobre a trajetória</h2>
        <p className={styles.lead}>Formação, experiências e caminhos de atuação.</p>
        {egresso.descricao?.trim() ? <div className={styles.biography}><p>{egresso.descricao}</p></div> : <div className={styles.aboutEmpty}>
          <span className={styles.emptyIcon}><FaRegFileAlt aria-hidden="true" /></span>
          <div><p>Uma apresentação da trajetória ainda não foi adicionada.</p><p>Explore as outras seções para conhecer sua formação e experiências.</p></div>
        </div>}
      </section>
        {featured && <section className={styles.featured} aria-labelledby="profile-featured-title"><h2 id="profile-featured-title">Conquista em evidência</h2><Link to={"/destaques/" + featured.id} className={styles.featuredLink}><Photo src={featured.imagem || egresso.foto} alt="" width={800} height={450} className={styles.featuredImage} /><div className={styles.featuredCaption}><span>Histórias da comunidade</span><h3>{featured.titulo || "Conquista publicada"}</h3><p>Ler história <FaArrowRight aria-hidden="true" /></p></div></Link></section>}
      </div>
      <aside className={styles.summary} aria-labelledby="profile-summary-title">
        <h2 id="profile-summary-title">Caminhos de atuação</h2>
        {sections.cargos ? <p className={styles.summaryEmpty}>As experiências estão indisponíveis no momento.</p> : pathways.length ? <ul className={styles.pathways}>{pathways.map(item => <li key={item.id_cargo}>
          <span className={styles.pathwayIcon}><FaChartBar aria-hidden="true" /></span>
          <div><p>{item.descricao}</p>{item.local && <span>{item.local}</span>}</div>
        </li>)}</ul> : <p className={styles.summaryEmpty}>As experiências compartilhadas por este egresso aparecerão aqui.</p>}
        <a className={styles.experienceLink} href="#profile-experience">Ver experiências <FaArrowRight aria-hidden="true" /></a>
      </aside>
    </div>
    <section className={styles.trajectory} aria-labelledby="profile-trajectory-title"><h2 id="profile-trajectory-title">Minha trajetória</h2>
      <Group id="profile-education" title="Formação" icon={FaGraduationCap}>
        {sections.cursos ? <ErrorState description={sections.cursos} onRetry={reload} /> : cursos.length ? <ol className={styles.timeline}>{orderedTrajectory(cursos).map(item => <li key={item.id_curso_egresso}><p className={styles.period}>{trajectoryPeriod(item)}</p><div><h4>{item.curso?.nome || "Curso"}</h4>{item.curso?.nivel && <p>{item.curso.nivel}</p>}</div></li>)}</ol> : <p className={styles.empty}>Nenhum curso registrado por enquanto.</p>}
      </Group>
      <Group id="profile-experience" title="Experiências" icon={FaBriefcase}>
        {sections.cargos ? <ErrorState description={sections.cargos} onRetry={reload} /> : cargos.length ? <ol className={styles.timeline}>{orderedTrajectory(cargos).map(item => <li key={item.id_cargo}><p className={styles.period}>{trajectoryPeriod(item)}</p><div><h4>{item.descricao || "Experiência profissional"}</h4>{item.local && <p>{item.local}</p>}</div></li>)}</ol> : <p className={styles.empty}>Nenhuma experiência registrada por enquanto.</p>}
      </Group>
      <Group id="profile-highlights" title="Conquistas" icon={FaMedal}>
        {sections.destaques ? <ErrorState description={sections.destaques} onRetry={reload} /> : destaques.length ? <><ol className={styles.timeline}>{destaques.map(item => <li key={item.id}><p className={styles.period}>{formatDate(item.dataPublicacao)}</p><div><h4><Link to={"/destaques/" + item.id}>{item.titulo || "Conquista da comunidade"}</Link></h4>{item.feitoDestaque && <p>{item.feitoDestaque}</p>}</div></li>)}</ol><Link className={styles.history} to={"/egresso/" + egresso.id_egresso + "/destaques"}><FaRegNewspaper aria-hidden="true" /> Ver histórico de conquistas <FaArrowRight aria-hidden="true" /></Link></> : <p className={styles.empty}>As conquistas publicadas pela coordenação aparecerão aqui.</p>}
      </Group>
      <Group id="profile-testimonials" title="Depoimentos" icon={FaRegComment}>
        {sections.depoimentos ? <ErrorState description={sections.depoimentos} onRetry={reload} /> : depoimentos.length ? <ul className={styles.testimonials}>{depoimentos.map(item => <li key={item.id_depoimento}><blockquote>{item.texto}</blockquote><div className={styles.quoteAuthor}><Photo src={egresso.foto} alt="" width={40} height={40} /><div><strong>{egresso.nome || "Egresso"}</strong><p>{formatDate(item.data)}</p></div></div></li>)}</ul> : <p className={styles.empty}>Nenhum depoimento compartilhado por enquanto.</p>}
      </Group>
    </section>
  </div>;
}
