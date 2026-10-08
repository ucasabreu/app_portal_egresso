import styles from "../ui/Control.module.css";

const TextArea = ({ rows = 4, className = "", ...props }) => {
  return (
    <textarea
      {...props}
      rows={rows}
      className={[styles.control, styles.textarea, className].join(" ")}
    />
  );
};
export default TextArea;
