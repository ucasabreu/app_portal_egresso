import DataTable from "react-data-table-component";
import styles from "./PortalTable.module.css";

const customStyles = {
  table: { style: { backgroundColor: "var(--color-surface)", color: "var(--color-text)", fontFamily: "var(--font-body)" } },
  headRow: { style: { backgroundColor: "var(--color-background)", minHeight: "56px", borderBottomColor: "var(--color-border)" } },
  headCells: { style: { color: "var(--color-brand)", fontSize: "14px", fontWeight: 650 } },
  rows: { style: { fontSize: "14px", minHeight: "64px", color: "var(--color-text)", borderBottomColor: "var(--color-border)" }, highlightOnHoverStyle: { backgroundColor: "var(--color-background)" } },
  cells: { style: { paddingTop: "16px", paddingBottom: "16px" } },
  pagination: { style: { color: "var(--color-text-muted)", backgroundColor: "var(--color-surface)", minHeight: "56px", borderTopColor: "var(--color-border)", fontSize: "13px" } },
};
export default function PortalTable({ ariaLabel = "Registros do painel", ...props }) {
  return (
    <div className={styles.table} role="region" aria-label={ariaLabel} tabIndex={0}>
      <DataTable customStyles={customStyles} pagination highlightOnHover responsive
        noDataComponent={<p className={styles.empty}>Nenhum registro encontrado.</p>}
        paginationComponentOptions={{ rowsPerPageText: "Registros por página:", rangeSeparatorText: "de", selectAllRowsItem: true, selectAllRowsItemText: "Todos" }}
        {...props} />
    </div>
  );
}
