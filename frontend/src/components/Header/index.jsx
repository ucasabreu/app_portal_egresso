import { useAuth, accountPath } from "../../auth/AuthContext.js";
import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import Logo from "../../assets/ufmalogo.png";
import LogoutButton from "../ui/LogoutButton";
import Container from "../ui/Container";
import styles from "./Header.module.css";

const links = [
  ["/", "Início"], ["/egressos/listar", "Comunidade"], ["/destaques", "Histórias"],
  ["/egressos/depoimentos", "Depoimentos"], ["/proposta", "Proposta"],
];

export default function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const closeMenu = () => setOpen(false);
  const handleEscape = event => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu();
      toggleRef.current?.focus();
    }
  };

  return (
    <header className={styles.header} onKeyDown={handleEscape}>
      <Container className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={closeMenu}>
          <img src={Logo} alt="UFMA" width={1080} height={1080} decoding="async" />
          <span>Portal de Egressos<small>Universidade Federal do Maranhão</small></span>
        </Link>
        <button ref={toggleRef} className={styles.toggle} type="button" aria-expanded={open}
          aria-controls="portal-navigation" aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen(value => !value)}>
          {open ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
        <nav id="portal-navigation" aria-label="Navegação principal" className={[styles.nav, open ? styles.open : ""].join(" ")}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={closeMenu}
              className={({ isActive }) => [styles.navLink, isActive ? styles.active : ""].join(" ")}>{label}</NavLink>
          ))}
          <div className={styles.actions}>
            <Link to="/egressos/listar" className={styles.search} aria-label="Buscar egressos" onClick={closeMenu}><FaSearch aria-hidden="true" /></Link>
            <Link to={accountPath(user)} className={styles.access} onClick={closeMenu}>{user?.role === "egresso" ? "Meu espaço" : user ? "Minha área" : "Entrar"}</Link>
            {user && <LogoutButton className={styles.logout}>Sair</LogoutButton>}
          </div>
        </nav>
      </Container>
    </header>
  );
}
