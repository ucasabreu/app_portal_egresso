import { Link } from "react-router-dom";
import { FaLayerGroup, FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import Logo from "../../assets/ufmalogo.png";
import styles from "./AdminShell.module.css";

export default function AdminShell({ title, description, login, sections, stats, children }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} to="/"><img src={Logo} alt="UFMA" /><span>Portal de Egressos<small>Área da coordenação</small></span></Link>
        <div className={styles.context}><FaLayerGroup aria-hidden="true" /><span>Painel de gestão</span></div>
        <nav aria-label="Seções do painel">{sections.map(([id, label]) => <a key={id} href={"#" + id}>{label}<span aria-hidden="true">↗</span></a>)}</nav>
        <div className={styles.bottom}><p>Conecte trajetórias.<br />Valorize conquistas.</p><Link to="/"><FaArrowLeft aria-hidden="true" /> Voltar ao portal</Link><Link to="/login"><FaSignOutAlt aria-hidden="true" /> Trocar conta</Link></div>
      </aside>
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <header className={styles.header}><div><p className={styles.eyebrow}>Comunidade em movimento</p><h1>{title}</h1><p>{description}</p></div>{login && <span className={styles.account}>{login}</span>}</header>
        {stats && <div className={styles.stats}>{stats.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
        {children}
      </main>
    </div>
  );
}
