import { useId } from "react";
import Breadcrumb from "./Breadcrumb";
import Photo from "./Photo";
import styles from "./PageBanner.module.css";

export default function PageBanner({ title, titleId, headerId, eyebrow, description, breadcrumb, actions, image, imageAlt = "", caption, children, variant = "page" }) {
  const generatedId = useId();
  const headingId = titleId || generatedId;
  return <div className={styles.section}>
    {breadcrumb?.length > 0 && <Breadcrumb items={breadcrumb} />}
    <header id={headerId} className={[styles.hero, image ? styles.withImage : "", styles[variant] || ""].join(" ")} aria-labelledby={headingId}>
      <div className={styles.copy}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 id={headingId}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
        {children}
      </div>
      {image && <div className={styles.visual}>
        <Photo src={image} alt={imageAlt} loading="eager" fetchPriority={variant === "home" ? "high" : "auto"} decoding="async" width={960} height={640} />
        {caption && <p className={styles.caption}>{caption}</p>}
      </div>}
    </header>
  </div>;
}
