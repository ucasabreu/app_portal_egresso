import { errorMessage } from "../utils/presentation.js";
import { orderedDestaques } from "../utils/destaques.js";

export async function loadProfile(get, id, includeDestaques = false) {
  const keys = ["cargos", "cursos", "depoimentos", ...(includeDestaques ? ["destaques"] : [])];
  const paths = [
    "/api/egressos/buscar/egresso/" + id, "/api/egressos/egresso/" + id + "/cargos",
    "/api/egressos/egresso/" + id + "/cursos_egresso", "/api/egressos/egresso/" + id + "/depoimentos",
    ...(includeDestaques ? ["/api/coordenadores/destaque/egresso/" + id] : []),
  ];
  const results = await Promise.allSettled(paths.map(path => get(path)));
  if (results[0].status === "rejected") throw results[0].reason;
  const egresso = results[0].value;
  if (!egresso || Array.isArray(egresso) || String(egresso.id_egresso) !== String(id)) {
    throw new Error("O serviço retornou um perfil em um formato inesperado.");
  }
  const next = { egresso, cargos: [], cursos: [], depoimentos: [], destaques: [], sections: {}, warnings: [] };
  results.slice(1).forEach((result, index) => {
    const name = keys[index];
    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      next[name] = name === "destaques" ? orderedDestaques(result.value) : result.value;
    } else {
      next.sections[name] = result.status === "rejected" ? errorMessage(result.reason) : "O serviço retornou dados em um formato inesperado.";
      next.warnings.push("Não foi possível carregar " + name + " deste perfil.");
    }
  });
  return next;
}
