export async function loadDestaque(get, id) {
  if (!/^[1-9]\d*$/.test(String(id))) throw new Error("O endereço desta publicação é inválido.");
  const data = await get("/api/coordenadores/buscar/destaque/" + id);
  if (!data || Array.isArray(data) || String(data.id) !== String(id)) {
    throw new Error("O serviço retornou uma publicação em um formato inesperado.");
  }
  return data;
}
