import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import useMutation from "../../hooks/useMutation.js";
import Field from "./Field";
import Select from "./Select";
import Button from "../Button/Button";
import Notice from "../feedback/Notice";
import styles from "./ManagementForm.module.css";

export default function CoordinatorForm({ onSaved }) {
  const [values, setValues] = useState({ login: "", senha: "", tipo: "coordenador" });
  const { busy, notice, run } = useMutation();
  const change = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));
  const save = async event => {
    event.preventDefault();
    if (await run(() => axios.post(API_URL + "/api/coordenadores/salvar/coordenador", values), "Conta de coordenação cadastrada.", onSaved)) setValues({ login: "", senha: "", tipo: "coordenador" });
  };
  return <section className={styles.panel} id="new-coordinator"><h2>Cadastrar conta de coordenação</h2><form className={styles.form} onSubmit={save} aria-busy={busy}>
    {notice && <Notice variant={notice.variant}><p>{notice.text}</p></Notice>}
    <Field label="Login da conta" name="login" value={values.login} onChange={change} minLength={4} maxLength={20} pattern="[a-zA-Z0-9._]+" autoComplete="off" required disabled={busy} />
    <Field label="Senha inicial" name="senha" type="password" value={values.senha} onChange={change} minLength={8} maxLength={128} autoComplete="new-password" required disabled={busy} />
    <Field as={Select} label="Tipo de coordenação" name="tipo" value={values.tipo} onChange={change} disabled={busy}><option value="coordenador">Coordenador de curso</option><option value="geral">Coordenador geral</option></Field>
    <Button type="submit" loading={busy}>Cadastrar conta</Button>
  </form></section>;
}
