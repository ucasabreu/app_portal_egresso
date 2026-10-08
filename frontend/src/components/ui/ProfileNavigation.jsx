import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ProfileNavigation.module.css";

const links = [["profile-about", "Sobre"], ["profile-education", "Formação"], ["profile-experience", "Experiências"], ["profile-highlights", "Conquistas"], ["profile-testimonials", "Depoimentos"]];
export default function ProfileNavigation({ items = links, variant = "tabs", label = "Nesta trajetória" }) {
  const { hash } = useLocation();
  const [active, setActive] = useState(hash?.slice(1) || items[0][0]);
  useEffect(() => { const change = () => setActive(window.location.hash.slice(1) || items[0][0]); window.addEventListener("hashchange", change); return () => window.removeEventListener("hashchange", change); }, [items]);
  return <nav className={[styles.navigation, variant === "sidebar" ? styles.sidebar : variant === "public" ? styles.publicTabs : ""].join(" ")} aria-label={label}>{items.map(([id, label, icon]) => { const Icon = icon; return <a key={id} href={"#" + id} aria-current={active === id ? "location" : undefined} onClick={() => setActive(id)}>{Icon && <Icon aria-hidden="true" />}{label}</a>; })}</nav>;
}
