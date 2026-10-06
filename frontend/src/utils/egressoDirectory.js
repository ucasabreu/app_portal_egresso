export const emptyFilters = { nome: "", curso: "", cargo: "", anoInicio: "", anoFim: "" };
export const filterLabels = { nome: "Nome", curso: "Curso", cargo: "Cargo", anoInicio: "Ingresso", anoFim: "Conclusão" };

export function readDirectory(search) {
  const params = new URLSearchParams(search);
  const filters = Object.fromEntries(Object.keys(emptyFilters).map(key => {
    let value = (params.get(key) || "").trim();
    if (key.startsWith("ano") && (!/^\d{4}$/.test(value) || Number(value) < 1900 || Number(value) > 2100)) value = "";
    return [key, value];
  }));
  const page = Number(params.get("pagina"));
  const size = Number(params.get("tamanho"));
  return { filters, order: params.get("ordem") === "nome-desc" ? "nome-desc" : "nome-asc", page: Number.isSafeInteger(page) && page > 0 ? page : 1, size: [6, 12, 24].includes(size) ? size : 6 };
}

export function directorySearch(view) {
  const params = new URLSearchParams();
  Object.keys(emptyFilters).forEach(key => {
    const value = String(view.filters[key] || "").trim();
    if (value) params.set(key, value);
  });
  if (view.order === "nome-desc") params.set("ordem", view.order);
  if (view.page > 1) params.set("pagina", view.page);
  if (view.size !== 6) params.set("tamanho", view.size);
  return params.toString();
}

const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });
export function directoryPage(records, view) {
  const sorted = [...records].sort((a, b) => {
    const names = collator.compare(a.nome || "", b.nome || "");
    return (view.order === "nome-desc" ? -names : names) || collator.compare(String(a.id_egresso), String(b.id_egresso));
  });
  const pages = Math.max(1, Math.ceil(sorted.length / view.size));
  const page = Math.min(view.page, pages);
  const offset = (page - 1) * view.size;
  return { items: sorted.slice(offset, offset + view.size), total: sorted.length, page, pages, first: sorted.length ? offset + 1 : 0, last: Math.min(offset + view.size, sorted.length) };
}

export function cardFormation(courses = []) {
  return courses.filter(item => item?.curso?.nome).sort((a, b) => (b.ano_inicio || 0) - (a.ano_inicio || 0) || (b.ano_fim || 0) - (a.ano_fim || 0))[0];
}

export function cardExperience(jobs = []) {
  return jobs.filter(item => item?.descricao).sort((a, b) => Number(b.ano_fim == null) - Number(a.ano_fim == null) || (b.ano_fim || b.ano_inicio || 0) - (a.ano_fim || a.ano_inicio || 0))[0];
}

export function trajectoryPeriod(record) {
  if (!record) return "";
  return [record.ano_inicio, record.ano_fim ?? "Em andamento"].filter(value => value != null && value !== "").join(" – ");
}

export function directoryReturn(path) {
  return typeof path === "string" && /^\/egressos\/listar(?:\?[^#]*)?$/.test(path) ? path : "/egressos/listar";
}
