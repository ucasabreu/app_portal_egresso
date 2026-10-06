import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import styles from "./Notice.module.css";

const icons = {
  info: FaInfoCircle,
  success: FaCheckCircle,
  warning: FaExclamationTriangle,
  error: FaExclamationCircle,
};

export default function Notice({ variant = "info", title, children, className = "", ...props }) {
  const Icon = icons[variant] || icons.info;

  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      {...props}
      className={[styles.notice, styles[variant] || styles.info, className].join(" ")}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {children}
      </div>
    </div>
  );
}
