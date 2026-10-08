import styles from "./Container.module.css";

export default function Container({
  as: element = "div",
  narrow = false,
  children,
  className = "",
  ...props
}) {
  const Element = element;

  return (
    <Element
      {...props}
      className={[styles.container, narrow ? styles.narrow : "", className].join(" ")}
    >
      {children}
    </Element>
  );
}
