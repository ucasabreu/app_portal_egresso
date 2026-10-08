import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext.js";
import Button from "../Button/Button";
import Notice from "../feedback/Notice";
import ConfirmDialog from "./ConfirmDialog";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSignOutAlt, FaUserCircle, FaGraduationCap, FaUsers, FaRegNewspaper, FaRegFileAlt, FaThLarge, FaPlus, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import PageBanner from "./PageBanner";
import Network from "../../assets/network.jpg";
import Logo from "../../assets/ufmalogo.png";
import styles from "./AdminShell.module.css";

export default function AdminShell({ title, description, login, sections, stats, children, dirty = false, pending = false, onExitConfirmed, onExitFailed, onSectionChange }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [active, setActive] = useState(hash.slice(1));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const running = useRef(false);
  const errorRef = useRef(null);
  const menuToggle = useRef(null);
  const mainRef = useRef(null);
  const topbarRef = useRef(null);
  const sectionKey = sections.map(([id]) => id).join("|");
  const icons = { "dashboard-summary": FaThLarge, courses: FaGraduationCap, graduates: FaUsers, highlights: FaRegNewspaper, drafts: FaRegFileAlt, coordinators: FaUsers, "new-course": FaPlus, "new-coordinator": FaUserPlus };
  const statIcons = [FaGraduationCap, FaUsers, FaRegNewspaper, FaRegFileAlt];
  const general = auth.user?.role === "geral";
  useEffect(() => { const changed = () => setActive(window.location.hash.slice(1)); window.addEventListener("hashchange", changed); return () => window.removeEventListener("hashchange", changed); }, []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    let observer;
    const observeSections = () => {
      observer?.disconnect();
      const visible = new Map();
      const topOffset = (topbarRef.current?.getBoundingClientRect().height || 76) + 12;
      const bottomOffset = Math.max(0, Math.round(window.innerHeight * .55));
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.target);
          else visible.delete(entry.target.id);
        });
        const nearest = [...visible.values()].sort((a, b) => Math.abs(a.getBoundingClientRect().top - topOffset) - Math.abs(b.getBoundingClientRect().top - topOffset))[0];
        if (nearest) setActive(nearest.id);
      }, { rootMargin: `-${topOffset}px 0px -${bottomOffset}px 0px`, threshold: 0 });
      sectionKey.split("|").forEach(id => {
        const target = mainRef.current?.querySelector(`[id="${id}"]`);
        if (target) observer.observe(target);
      });
    };
    observeSections();
    window.addEventListener("resize", observeSections);
    return () => { observer.disconnect(); window.removeEventListener("resize", observeSections); };
  }, [sectionKey, children]);
  const closeMenu = event => {
    if (event.key === "Escape" && menuOpen) {
      event.preventDefault();
      setMenuOpen(false);
      menuToggle.current?.focus();
    }
  };
  const selectSection = id => {
    onSectionChange?.(id);
    setActive(id);
    setMenuOpen(false);
    if (menuOpen || onSectionChange) requestAnimationFrame(() => {
      const target = mainRef.current?.querySelector(`[id="${id}"]`);
      target?.scrollIntoView?.({ block: "start" });
      if (menuOpen) {
        target?.setAttribute("tabindex", "-1");
        target?.focus({ preventScroll: true });
      }
    });
  };
  const logout = async () => {
    if (running.current || pending) return;
    running.current = true; setBusy(true); setError(""); onExitConfirmed?.();
    try { await auth.logout(); setConfirmExit(false); navigate("/login", { replace: true }); }
    catch { onExitFailed?.(); setConfirmExit(false); setError("Não foi possível encerrar a sessão. Seus dados do formulário foram mantidos. Tente novamente."); }
    finally { running.current = false; setBusy(false); }
  };
  return (
    <div className={styles.shell}>
      <div ref={topbarRef} className={styles.topbar} onKeyDown={closeMenu}>
        <Link className={styles.brand} to="/"><img src={Logo} alt="UFMA" width={1080} height={1080} decoding="async" /><span>Portal de Egressos<small>Universidade Federal do Maranhão</small></span></Link>
        <div className={styles.account}><FaUserCircle aria-hidden="true" /><div><strong>{login || "Conta de coordenação"}</strong><span>{general ? "Coordenação geral" : "Coordenação de curso"}</span></div></div>
        <Button ref={menuToggle} className={styles.menuToggle} variant="secondary" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />} Menu</Button>
      </div>
      <aside id="admin-navigation" className={[styles.sidebar, menuOpen ? styles.sidebarOpen : ""].join(" ")} onKeyDown={closeMenu} aria-label="Navegação da coordenação">
        <div className={styles.menuAccount}><strong>{login || "Conta de coordenação"}</strong><span>{general ? "Coordenação geral" : "Coordenação de curso"}</span></div>
        <nav aria-label="Seções do painel">{sections.map(([id, label]) => { const Icon = icons[id] || FaThLarge; return <a key={id} href={"#" + id} aria-current={(active || "dashboard-summary") === id ? "location" : undefined} onClick={() => selectSection(id)}><Icon aria-hidden="true" />{label}</a>; })}</nav>
        <div className={styles.bottom}><Link to="/"><FaArrowLeft aria-hidden="true" /> Voltar ao portal</Link><Button variant="ghost" disabled={pending} onClick={() => dirty ? setConfirmExit(true) : logout()} loading={busy} loadingLabel="Saindo…"><FaSignOutAlt aria-hidden="true" /> Sair da conta</Button></div>
      </aside>
      <main ref={mainRef} id="main-content" tabIndex={-1} className={styles.main}>
        <PageBanner headerId="dashboard-summary" variant="compact" eyebrow={general ? "Painel da coordenação geral" : "Painel da coordenação"} title={title} description={description} image={Network} />
        {error && <Notice ref={errorRef} tabIndex={-1} variant="error" className={styles.notice}><p>{error}</p></Notice>}
        {stats && <dl className={styles.stats} style={{ "--stats-count": Math.min(stats.length, 4) }} aria-label="Resumo do painel">{stats.map(([label, value, hint], index) => { const Icon = statIcons[index % statIcons.length]; return <div key={label}><Icon className={styles.statIcon} aria-hidden="true" /><dt>{label}</dt><dd>{value}</dd>{hint && <p>{hint}</p>}</div>; })}</dl>}
        {children}
      </main>
      <ConfirmDialog open={confirmExit} title="Sair com alterações pendentes?" description="O conteúdo ainda não salvo será perdido ao encerrar a sessão. Rascunhos já salvos no banco continuam disponíveis." confirmLabel="Descartar e sair da conta" pending={busy} pendingLabel="Saindo…" onCancel={() => setConfirmExit(false)} onConfirm={logout} />
    </div>
  );
}
