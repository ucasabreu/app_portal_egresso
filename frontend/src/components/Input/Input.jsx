import styles from "../ui/Control.module.css";

const Input = ({ className = "", ...props }) => {
  return (
    <input {...props} className={[styles.control, className].join(" ")} />
  );
};
export default Input;
