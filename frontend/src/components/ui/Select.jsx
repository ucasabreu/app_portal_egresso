import styles from "./Control.module.css";

export default function Select({ children, className = "", ...props }) {
  return (
    <select {...props} className={[styles.control, className].join(" ")}>
      {children}
    </select>
  );
}
