import { FaEnvelope, FaLinkedin, FaInstagram, FaFileAlt } from "react-icons/fa";
import Photo from "./Photo";
import { formatDate } from "../../utils/presentation";
import styles from "./ProfileDetails.module.css";

export default function ProfileDetails({ egresso, cargos, cursos, depoimentos, cargoAction, cursoAction, depoimentoAction, renderDelete }) {
  const links = [[egresso.linkedin, FaLinkedin, "LinkedIn"], [egresso.instagram, FaInstagram, "Instagram"], [egresso.curriculo, FaFileAlt, "Currículo"]];
  return (
    <div className={styles.layout}>
      <aside className={styles.identity} aria-label="Identificação e contato">
        <Photo src={egresso.foto} alt={egresso.nome} className={styles.photo} />
        <p className={styles.badge}>Comunidade de egressos</p><h2>{egresso.nome}</h2>
        {egresso.email && <a className={styles.contact} href={"mailto:" + egresso.email}><FaEnvelope aria-hidden="true" />{egresso.email}</a>}
        <div className={styles.links}>{links.filter(([url]) => url).map(([url, icon, label]) => {
          const Icon = icon;
          return (
          <a href={url} key={label} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" />{label} ↗</a>
          );
        })}</div>
      </aside>
      <div className={styles.sections}>
        <section className={styles.panel}><p className={styles.eyebrow}>Apresentação</p><h2>Sobre esta trajetória</h2><p className={styles.description}>{egresso.descricao || "Este egresso ainda não adicionou uma apresentação."}</p></section>
        <section id="profile-education" className={styles.panel}><p className={styles.eyebrow}>Formação acadêmica</p><h2>Cursos e aprendizados</h2>
          {cursos.length ? <ul className={styles.records}>{cursos.map(item => <li key={item.id_curso_egresso}>
            <div><h3>{item.curso?.nome || "Curso"}</h3><p>{item.curso?.nivel}</p><p className={styles.period}>{item.ano_inicio} – {item.ano_fim || "Em andamento"}</p></div>
            {renderDelete?.("curso", item.id_curso_egresso)}
          </li>)}</ul> : <p className={styles.empty}>Nenhum curso registrado por enquanto.</p>}{cursoAction}
        </section>
        <section id="profile-experience" className={styles.panel}><p className={styles.eyebrow}>Experiência profissional</p><h2>Caminhos de atuação</h2>
          {cargos.length ? <ul className={styles.records}>{cargos.map(item => <li key={item.id_cargo}>
            <div><h3>{item.nome || item.descricao}</h3><p>{item.local}</p>{item.nome && <p>{item.descricao}</p>}<p className={styles.period}>{item.ano_inicio} – {item.ano_fim || "Atual"}</p></div>
            {renderDelete?.("cargo", item.id_cargo)}
          </li>)}</ul> : <p className={styles.empty}>Nenhuma experiência registrada por enquanto.</p>}{cargoAction}
        </section>
        <section id="profile-testimonials" className={styles.panel}><p className={styles.eyebrow}>Memórias e experiências</p><h2>Depoimentos</h2>
          {depoimentos.length ? <ul className={styles.records}>{depoimentos.map(item => <li key={item.id_depoimento}>
            <div><blockquote className={styles.description}>{item.texto}</blockquote><p className={styles.period}>{formatDate(item.data)}</p></div>
            {renderDelete?.("depoimento", item.id_depoimento)}
          </li>)}</ul> : <p className={styles.empty}>Nenhum depoimento compartilhado por enquanto.</p>}{depoimentoAction}
        </section>
      </div>
    </div>
  );
}
