import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config/config.js";
import useMutation from "../../hooks/useMutation.js";
import { coordinatorErrors, focusFirstError } from "../../utils/management.js";
import Field from "./Field";
import Select from "./Select";
import Button from "../Button/Button";
import Notice from "../feedback/Notice";
import styles from "./ManagementForm.module.css";

const empty = { login: "", senha: "", tipo: "coordenador" };
export default function CoordinatorForm({ onSaved, disabled = false, onStateChange }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [review, setReview] = useState(false);
  const { busy, notice, run } = useMutation();
  const form = useRef(null);
  const heading = useRef(null);
  const errorRef = useRef(null);
  const dirty = Boolean(values.login || values.senha || values.tipo !== empty.tipo);
  useEffect(() => { onStateChange?.({ dirty, busy }); }, [dirty, busy, onStateChange]);
  useEffect(() => { if (Object.keys(errors).length) focusFirstError(form.current, errors); }, [errors]);
  useEffect(() => { if (review) heading.current?.focus(); }, [review]);
  useEffect(() => { if (notice?.variant === "error") errorRef.current?.focus(); }, [notice]);
  const change = event => { setValues(current => ({ ...current, [event.target.name]: event.target.value })); setErrors({}); };
  const save = async event => {
    event.preventDefault();
    if (busy || disabled) return;
    const next = coordinatorErrors(values); setErrors(next);
    if (Object.keys(next).length) { setReview(false); return; }
    if (!review) { setReview(true); return; }
    if (await run(() => axios.post(API_URL + "/api/coordenadores/salvar/coordenador", values), "Conta de coordenação cadastrada.", onSaved)) { setValues(empty); setReview(false); }
  };
  return <section className={styles.panel} id="new-coordinator" aria-labelledby="new-coordinator-title"><header className={styles.heading}><p className={styles.step}>Gestão de acesso</p><h2 id="new-coordinator-title" ref={heading} tabIndex={-1}>Cadastrar conta de coordenação</h2><p>Defina o acesso e confira o tipo de conta antes de confirmar.</p></header>
    <form ref={form} className={styles.form} onSubmit={save} noValidate aria-busy={busy}>
      {notice && <Notice ref={errorRef} tabIndex={-1} variant={notice.variant}><p>{notice.text}</p></Notice>}
      {review ? <><Notice title="Confira a nova conta"><p>A senha será enviada apenas ao confirmar o cadastro.</p></Notice><dl className={styles.review}><div><dt>Login</dt><dd>{values.login}</dd></div><div><dt>Tipo de acesso</dt><dd>{values.tipo === "geral" ? "Coordenação geral" : "Coordenação de curso"}</dd></div><div><dt>Senha inicial</dt><dd>Definida no formulário; não exibida na revisão.</dd></div></dl></> : <>
        <div className={styles.columns}><Field label="Login da conta" name="login" value={values.login} onChange={change} error={errors.login} minLength={4} maxLength={20} autoComplete="off" hint="4 a 20 caracteres: letras, números, ponto ou underline." required disabled={busy || disabled} />
          <Field label="Senha inicial" name="senha" type="password" value={values.senha} onChange={change} error={errors.senha} minLength={8} maxLength={128} autoComplete="new-password" hint="Use de 8 a 128 caracteres." required disabled={busy || disabled} /></div>
        <Field as={Select} label="Tipo de coordenação" name="tipo" value={values.tipo} onChange={change} error={errors.tipo} disabled={busy || disabled}><option value="coordenador">Coordenador de curso</option><option value="geral">Coordenador geral</option></Field>
      </>}
      <div className={styles.actions}>{review && <Button variant="secondary" disabled={busy || disabled} onClick={() => setReview(false)}>Continuar editando</Button>}<Button type="submit" disabled={disabled} loading={busy} loadingLabel="Cadastrando conta…">{review ? "Confirmar cadastro da conta" : "Revisar conta"}</Button></div>
    </form>
  </section>;
}
