import styles from "./FilterTabs.module.css";

export default function FilterTabs({ id, label, items, value, onChange, panelId }) {
  const select = (event, index) => {
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
    event.preventDefault();
    const next = key === "Home" ? 0 : key === "End" ? items.length - 1 : (index + (key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    onChange(items[next].value);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus();
  };
  return <div className={styles.tabs} role="tablist" aria-label={label}>{items.map((item, index) => <button key={item.value} id={id + "-" + item.value} type="button" role="tab" aria-selected={value === item.value} aria-controls={panelId} tabIndex={value === item.value ? 0 : -1} onClick={() => onChange(item.value)} onKeyDown={event => select(event, index)}>{item.label}{item.count != null && <span>{item.count}</span>}</button>)}</div>;
}
