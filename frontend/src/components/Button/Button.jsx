import styles from "./Button.module.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  loadingLabel = "Aguarde…",
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      className={["button-geral", styles.button, styles[variant] || styles.primary, className].join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || props["aria-busy"]}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {loading ? loadingLabel : children}
    </button>
  );
};
export default Button;
