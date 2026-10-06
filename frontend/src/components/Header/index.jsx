import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaArrowRight } from "react-icons/fa";
import Logo from "../../assets/ufmalogo.png";
import Container from "../ui/Container";
import styles from "./Header.module.css";

const links = [
  ["/proposta", "O portal"], ["/egressos/listar", "Egressos"],
  ["/egressos/depoimentos", "Depoimentos"], ["/destaques", "Destaques"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={closeMenu}>
          <img src={Logo} alt="UFMA" width={1080} height={1080} decoding="async" />
          <span>Portal de Egressos<small>Conexões além da graduação</small></span>
        </Link>
        <button className={styles.toggle} type="button" aria-expanded={open} aria-controls="portal-navigation"
          aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(value => !value)}>
          {open ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
        <nav id="portal-navigation" aria-label="Navegação principal" className={[styles.nav, open ? styles.open : ""].join(" ")}
          onKeyDown={event => { if (event.key === "Escape") { closeMenu(); event.currentTarget.previousElementSibling?.focus(); } }}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={closeMenu}
              className={({ isActive }) => [styles.navLink, isActive ? styles.active : ""].join(" ")}>{label}</NavLink>
          ))}
          <Link to="/login" className={styles.access} onClick={closeMenu}>Coordenação</Link>
          <Link to="/edit-egresso" className={styles.join} onClick={closeMenu}>Participar <FaArrowRight aria-hidden="true" /></Link>
        </nav>
      </Container>
    </header>
  );
}
