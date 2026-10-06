import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { errorMessage } from "../utils/presentation";

export default function useDashboard(id, general = false) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ coordenador: null, coordenadores: [], cursos: [], destaques: [], sections: {}, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    const get = async path => (await axios.get(API_URL + path, { signal: controller.signal })).data;
    const load = async () => {
      setState(value => ({ ...value, loading: true, error: "" }));
      try {
        const coordenador = await get("/api/coordenadores/buscar/coordenador/" + id);
        const [allCourses, collection] = await Promise.all([
          get("/api/consultas/listar/cursos"), get(general ? "/api/consultas/listar/coordenadores" : "/api/coordenadores/destaque/listar"),
        ]);
        if (!Array.isArray(allCourses) || !Array.isArray(collection)) throw new Error("O serviço retornou dados em um formato inesperado.");
        if (general) {
          if (!controller.signal.aborted) setState({ coordenador, cursos: allCourses, coordenadores: collection.filter(item => item.id_coordenador !== coordenador.id_coordenador), destaques: [], sections: {}, loading: false, error: "" });
        } else {
          const courses = allCourses.filter(item => item.coordenador?.id_coordenador === coordenador.id_coordenador);
          const cursos = await Promise.all(courses.map(async course => {
            const associations = await get("/api/coordenadores/coordenador/" + course.id_curso + "/egressos_curso");
            if (!Array.isArray(associations)) throw new Error("Não foi possível carregar os egressos do curso.");
            return { ...course, egressos: associations.filter(item => item.egresso).map(item => ({
              id: item.egresso.id_egresso, nome: item.egresso.nome, email: item.egresso.email, anoInicio: item.ano_inicio, anoFim: item.ano_fim,
            })) };
          }));
          if (!controller.signal.aborted) setState({ coordenador, cursos, coordenadores: [], destaques: collection.filter(item => item.coordenador?.id_coordenador === coordenador.id_coordenador), sections: {}, loading: false, error: "" });
        }
      } catch (error) {
        if (!controller.signal.aborted) setState(value => ({ ...value, loading: false, error: errorMessage(error) }));
      }
    };
    load();
    return () => controller.abort();
  }, [id, general, revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
