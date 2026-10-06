const emptyMessages = {
  "/api/consultas/listar/cursos": "Não há cursos cadastrados.",
  "/api/consultas/listar/coordenadores": "Não há coordenadores cadastrados.",
  "/api/coordenadores/destaque/listar": "Não há destaques cadastrados.",
};

export async function getCollection(get, path) {
  try {
    const data = await get(path);
    if (!Array.isArray(data)) throw new Error("O serviço retornou dados em um formato inesperado.");
    return data;
  } catch (error) {
    const message = emptyMessages[path.split("?")[0]];
    if (error?.response?.status === 400 && message && error.response.data === message) return [];
    throw error;
  }
}
