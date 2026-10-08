export function errorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string") return data.message;
  if (data && typeof data === "object") {
    const messages = Object.values(data).filter(value => typeof value === "string");
    if (messages.length) return messages.join(" ");
  }
  return error?.response || error?.request
    ? "Não foi possível carregar os dados. Verifique se o serviço está disponível e tente novamente."
    : error?.message || "Não foi possível concluir a solicitação.";
}

export function formatDate(value) {
  if (!value) return "Data não informada";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : date.toLocaleDateString("pt-BR");
}
