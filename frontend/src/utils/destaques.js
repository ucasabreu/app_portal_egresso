export function orderedDestaques(items, order = "recentes") {
  const unique = new Map();
  items.forEach(item => {
    if (item?.id != null && !unique.has(String(item.id))) unique.set(String(item.id), item);
  });
  const timestamp = item => {
    const value = Date.parse(item.dataPublicacao);
    return Number.isNaN(value) ? null : value;
  };
  return [...unique.values()].sort((first, second) => {
    const a = timestamp(first), b = timestamp(second);
    if (a === b) {
      if (a == null) return 0;
      const firstId = Number(first.id), secondId = Number(second.id);
      if (!Number.isSafeInteger(firstId) || !Number.isSafeInteger(secondId)) return 0;
      return order === "antigos" ? firstId - secondId : secondId - firstId;
    }
    if (a == null) return 1;
    if (b == null) return -1;
    return order === "antigos" ? a - b : b - a;
  });
}

export function groupDestaques(items) {
  const groups = new Map();
  orderedDestaques(items).forEach(item => {
    const year = /^\d{4}-\d{2}-\d{2}$/.test(item.dataPublicacao || "")
      && !Number.isNaN(Date.parse(item.dataPublicacao)) ? item.dataPublicacao.slice(0, 4) : "Data não informada";
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(item);
  });
  return [...groups].map(([year, destaques]) => ({ year, destaques }));
}
