import { useState } from "react";
import useCollection from "../../hooks/useCollection";
import Field from "../ui/Field";
import Select from "../ui/Select";
import Button from "../Button/Button";
import LoadingState from "../feedback/LoadingState";
import ErrorState from "../feedback/ErrorState";
import PortalTable from "./PortalTable";
import styles from "./Table.module.css";

export default function TableCursos() {
  const { data, loading, error, retry } = useCollection("/api/consultas/listar/cursos");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const filtered = data.filter(item => (!name || item.nome === name) && (!level || item.nivel === level));
  const names = [...new Set(data.map(item => item.nome).filter(Boolean))].sort();
  const levels = [...new Set(data.map(item => item.nivel).filter(Boolean))].sort();
  if (loading) return <LoadingState label="Buscando cursos…" />;
  if (error) return <ErrorState description={error} onRetry={retry} />;
  return (
    <div className={styles.table}>
      <div className={styles.filters}>
        <Field as={Select} label="Curso" value={name} onChange={event => setName(event.target.value)}><option value="">Todos os cursos</option>{names.map(value => <option key={value}>{value}</option>)}</Field>
        <Field as={Select} label="Nível de formação" value={level} onChange={event => setLevel(event.target.value)}><option value="">Todos os níveis</option>{levels.map(value => <option key={value}>{value}</option>)}</Field>
        <Button variant="secondary" onClick={() => { setName(""); setLevel(""); }}>Limpar filtros</Button>
      </div>
      <PortalTable columns={[{ name: "Curso", selector: row => row.nome, sortable: true, wrap: true }, { name: "Nível de formação", selector: row => row.nivel, sortable: true }]} data={filtered} keyField="id_curso" />
    </div>
  );
}
