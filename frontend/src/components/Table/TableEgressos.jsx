import { useState } from "react";
import { Link } from "react-router-dom";
import useCollection from "../../hooks/useCollection";
import Field from "../ui/Field";
import Select from "../ui/Select";
import Button from "../Button/Button";
import LoadingState from "../feedback/LoadingState";
import ErrorState from "../feedback/ErrorState";
import PortalTable from "./PortalTable";
import styles from "./Table.module.css";

export default function TableEgressos() {
  const { data, loading, error, retry } = useCollection("/api/consultas/listar/cursoegresso");
  const [filters, setFilters] = useState({ nome: "", curso: "", nivel: "", ano: "" });
  const rows = data.filter(item => item.egresso && item.curso).map(item => ({
    key: item.id_curso_egresso || item.egresso.id_egresso + "-" + item.curso.id_curso,
    id: item.egresso.id_egresso, nome: item.egresso.nome, curso: item.curso.nome, nivel: item.curso.nivel, ano: item.ano_fim,
  }));
  const filtered = rows.filter(row => Object.entries(filters).every(([key, value]) => !value || String(row[key] ?? "") === value));
  const columns = [
    { name: "Egresso", selector: row => row.nome, sortable: true, wrap: true, cell: row => <Link className={styles.profileLink} to={"/egresso_view/" + row.id}>{row.nome}</Link> },
    { name: "Curso", selector: row => row.curso, sortable: true, wrap: true },
    { name: "Nível", selector: row => row.nivel, sortable: true },
    { name: "Conclusão", selector: row => row.ano ?? "Em andamento", sortable: true },
  ];
  if (loading) return <LoadingState label="Buscando formações dos egressos…" />;
  if (error) return <ErrorState description={error} onRetry={retry} />;
  return (
    <div className={styles.table}>
      <div className={styles.filters}>
        {Object.entries({ nome: "Nome", curso: "Curso", nivel: "Nível", ano: "Ano de conclusão" }).map(([key, label]) => (
          <Field key={key} as={Select} label={label} value={filters[key]} onChange={event => setFilters(values => ({ ...values, [key]: event.target.value }))}>
            <option value="">Todos</option>
            {[...new Set(rows.map(row => row[key]).filter(value => value != null))].sort().map(value => <option key={value} value={value}>{value}</option>)}
          </Field>
        ))}
        <Button variant="secondary" onClick={() => setFilters({ nome: "", curso: "", nivel: "", ano: "" })}>Limpar filtros</Button>
      </div>
      <PortalTable columns={columns} data={filtered} keyField="key" />
    </div>
  );
}
