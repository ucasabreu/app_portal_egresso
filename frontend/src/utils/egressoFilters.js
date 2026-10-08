const filters = {
  nome: ["nome", "nome"], curso: ["curso", "curso"], cargo: ["cargo", "cargo"],
  anoInicio: ["ano_inicio", "ano"], anoFim: ["ano_fim", "ano"],
};
export function egressoQueries(values) {
  const queries = Object.entries(filters).flatMap(([key, [path, param]]) => {
    const value = String(values[key] ?? "").trim();
    return value ? ["/api/consultas/listar/egressos/" + path + "?" + new URLSearchParams({ [param]: value })] : [];
  });
  return queries.length ? queries : ["/api/consultas/listar/egressos"];
}
export function intersectEgressos(collections) {
  if (!collections.length) return [];
  const remaining = collections.slice(1).map(items => new Set(items.filter(item => item?.id_egresso != null).map(item => String(item.id_egresso))));
  const seen = new Set();
  return collections[0].filter(item => {
    if (item?.id_egresso == null) return false;
    const id = String(item.id_egresso);
    if (seen.has(id) || !remaining.every(ids => ids.has(id))) return false;
    seen.add(id);
    return true;
  });
}
