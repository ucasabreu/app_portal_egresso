import DataTable from "react-data-table-component";

const customStyles = {
  table: { style: { backgroundColor: "var(--color-surface)", color: "var(--color-text)" } },
  headRow: { style: { backgroundColor: "var(--color-surface-muted)", minHeight: "52px", borderBottomColor: "var(--color-border)" } },
  headCells: { style: { color: "var(--color-brand)", fontSize: "13px", fontWeight: 700 } },
  rows: { style: { fontSize: "14px", minHeight: "60px", color: "var(--color-text)", borderBottomColor: "var(--color-border)" }, highlightOnHoverStyle: { backgroundColor: "var(--color-surface-muted)" } },
  cells: { style: { paddingTop: "12px", paddingBottom: "12px" } },
  pagination: { style: { color: "var(--color-text-muted)", borderTopColor: "var(--color-border)", fontSize: "13px" } },
};
export default function PortalTable(props) {
  return <DataTable customStyles={customStyles} pagination highlightOnHover responsive
    noDataComponent={<p style={{ padding: "2rem", color: "var(--color-text-muted)" }}>Nenhum registro encontrado.</p>}
    paginationComponentOptions={{ rowsPerPageText: "Registros por página:", rangeSeparatorText: "de", selectAllRowsItem: true, selectAllRowsItemText: "Todos" }}
    {...props} />;
}
