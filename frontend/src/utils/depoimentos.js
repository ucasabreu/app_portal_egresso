export function orderedDepoimentos(items) {
  const unique = new Map();
  items.forEach(item => {
    if (item?.id_depoimento != null && !unique.has(String(item.id_depoimento))) unique.set(String(item.id_depoimento), item);
  });
  const timestamp = item => {
    const value = Date.parse(item.data);
    return Number.isNaN(value) ? null : value;
  };
  return [...unique.values()].sort((a, b) => {
    const first = timestamp(a), second = timestamp(b);
    if (first === second) return 0;
    if (first == null) return 1;
    if (second == null) return -1;
    return second - first;
  });
}

export function depoimentoExcerpt(value, limit = 280) {
  const text = typeof value === "string" ? value.trim() : "";
  const characters = Array.from(text);
  if (characters.length <= limit) return { text, preview: text, truncated: false };
  let preview = characters.slice(0, limit).join("");
  const boundary = Math.max(preview.lastIndexOf(" "), preview.lastIndexOf("\n"));
  if (boundary > preview.length * .65) preview = preview.slice(0, boundary);
  return { text, preview: preview.trimEnd() + "…", truncated: true };
}

export function depoimentoYear(value) {
  const year = String(value || "").trim();
  return /^\d{4}$/.test(year) && Number(year) >= 1900 && Number(year) <= 2100 ? year : "";
}

export function depoimentosPath(year = "", limit) {
  const validYear = depoimentoYear(year);
  if (validYear) return "/api/consultas/listar/depoimentos/ano?" + new URLSearchParams({ ano: validYear });
  if (Number.isInteger(limit) && limit > 0) return "/api/consultas/listar/depoimentos/limite?" + new URLSearchParams({ limite: limit });
  return "/api/consultas/listar/depoimentos";
}
