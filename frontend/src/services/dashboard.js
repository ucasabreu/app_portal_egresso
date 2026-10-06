import { errorMessage } from "../utils/presentation.js";
import { getCollection } from "./collections.js";

export function sameId(first, second) {
  return first != null && second != null && String(first) === String(second);
}

export async function loadDashboard(get, id, general = false) {
  const coordenador = await get("/api/coordenadores/buscar/coordenador/" + id);
  if (coordenador?.id_coordenador == null) throw new Error("Não foi possível identificar a conta de coordenação.");
  const sections = {};
  const loadSection = async (name, path) => {
    try {
      return await getCollection(get, path);
    } catch (error) {
      sections[name] = errorMessage(error);
      return [];
    }
  };
  const [allCourses, records] = await Promise.all([
    loadSection("cursos", "/api/consultas/listar/cursos"),
    loadSection(general ? "coordenadores" : "destaques", general
      ? "/api/consultas/listar/coordenadores" : "/api/coordenadores/destaque/listar"),
  ]);
  if (general) return {
    coordenador, cursos: allCourses, destaques: [], sections,
    coordenadores: records.filter(item => !sameId(item.id_coordenador, coordenador.id_coordenador)),
  };
  const courses = allCourses.filter(item => sameId(item.coordenador?.id_coordenador, coordenador.id_coordenador));
  const cursos = await Promise.all(courses.map(async course => {
    try {
      const associations = await getCollection(get, "/api/coordenadores/coordenador/" + course.id_curso + "/egressos_curso");
      return { ...course, egressos: associations.filter(item => item.egresso).map(item => ({
        idVinculo: item.id_curso_egresso ?? null, id: item.egresso.id_egresso, nome: item.egresso.nome, email: item.egresso.email,
        anoInicio: item.ano_inicio, anoFim: item.ano_fim,
      })), egressosError: "" };
    } catch (error) {
      return { ...course, egressos: [], egressosError: errorMessage(error) };
    }
  }));
  return {
    coordenador, cursos, coordenadores: [], sections,
    destaques: records.filter(item => sameId(item.coordenador?.id_coordenador, coordenador.id_coordenador)),
  };
}
