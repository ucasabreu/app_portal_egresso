import { Link } from "react-router-dom";
import styles from "./Breadcrumb.module.css";

export default function Breadcrumb({ items, label = "Caminho da página" }) {
  return <nav aria-label={label} className={styles.breadcrumb}><ol>
    {items.map((item, index) => <li key={item.to || index}>
      {index > 0 && <span className={styles.separator} aria-hidden="true">/</span>}
      {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}
    </li>)}
  </ol></nav>;
}
