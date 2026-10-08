import { useId } from "react";
import Input from "../Input/Input";
import styles from "./Field.module.css";

export default function Field({
  as: control = Input,
  label,
  labelAction,
  hideLabel = false,
  hint,
  error,
  id,
  required = false,
  className = "",
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}) {
  const Control = control;
  const generatedId = useId();
  const controlId = id || generatedId;
  const hintId = hint ? controlId + "-hint" : undefined;
  const errorId = error ? controlId + "-error" : undefined;
  const description = [describedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={[styles.field, className].join(" ")}>
      <div className={[styles.heading, hideLabel && !labelAction ? styles.hiddenHeading : ""].join(" ")}>
        <label className={styles.label} htmlFor={controlId}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
        {labelAction}
      </div>
      <Control
        {...props}
        id={controlId}
        required={required}
        aria-describedby={description}
        aria-invalid={error ? true : invalid}
      />
      {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
      {error && <p id={errorId} className={styles.error}>{error}</p>}
    </div>
  );
}
