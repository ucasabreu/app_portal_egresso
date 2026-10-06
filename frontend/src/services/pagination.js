export function readPage(data) {
  if (!data || !Array.isArray(data.items) || !Number.isSafeInteger(data.total) || data.total < 0
    || !Number.isSafeInteger(data.page) || data.page < 1 || !Number.isSafeInteger(data.pages) || data.pages < data.page
    || !Number.isSafeInteger(data.size) || data.size < 1 || data.size > 100 || data.items.length > data.size
    || !Number.isSafeInteger(data.first) || !Number.isSafeInteger(data.last)
    || data.pages !== Math.max(1, Math.ceil(data.total / data.size))
    || data.first !== (data.total ? (data.page - 1) * data.size + 1 : 0)
    || data.last !== (data.total ? data.first + data.items.length - 1 : 0)
    || data.last > data.total || (!data.total && data.items.length)) {
    throw new Error("O serviço retornou uma página em um formato inesperado.");
  }
  return data;
}
