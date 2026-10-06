const emptyMessages = {
  "/api/consultas/listar/cursos": "Não há cursos cadastrados.",
  "/api/consultas/listar/coordenadores": "Não há coordenadores cadastrados.",
  "/api/coordenadores/destaque/listar": "Não há destaques cadastrados.",
  "/api/consultas/listar/egressos": "Não há egressos cadastrados.",
  "/api/consultas/listar/egressos/nome": ["Não há egressos cadastrados.", "Não há egressos com o nome informado."],
  "/api/consultas/listar/egressos/curso": ["Não há egressos cadastrados.", "Não há egressos com o curso informado."],
  "/api/consultas/listar/egressos/cargo": ["Não há egressos cadastrados.", "Não há cargos cadastrados.", "Não há egressos com o cargo informado."],
  "/api/consultas/listar/egressos/ano_inicio": ["Não há egressos cadastrados.", "Não há egressos para o ano informado."],
  "/api/consultas/listar/egressos/ano_fim": ["Não há egressos cadastrados.", "Não há egressos para o ano informado."],
  "/api/consultas/listar/depoimentos": "Não há depoimentos cadastrados.",
  "/api/consultas/listar/depoimentos/limite": "Não há depoimentos cadastrados.",
  "/api/consultas/listar/depoimentos/ano": ["Não há depoimentos cadastrados.", "Não há depoimentos para o ano informado."],
};

export async function getCollection(get, path) {
  try {
    const data = await get(path);
    if (!Array.isArray(data)) throw new Error("O serviço retornou dados em um formato inesperado.");
    return data;
  } catch (error) {
    const message = emptyMessages[path.split("?")[0]];
    if (error?.response?.status === 400 && message && [message].flat().includes(error.response.data)) return [];
    throw error;
  }
}
