import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { errorMessage } from "../utils/presentation";

export default function useProfile(id) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ egresso: null, cargos: [], cursos: [], depoimentos: [], warnings: [], loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState(value => ({ ...value, loading: true, error: "", warnings: [] }));
    const paths = [
      "/api/egressos/buscar/egresso/" + id, "/api/egressos/egresso/" + id + "/cargos",
      "/api/egressos/egresso/" + id + "/cursos_egresso", "/api/egressos/egresso/" + id + "/depoimentos",
    ];
    Promise.allSettled(paths.map(path => axios.get(API_URL + path, { signal: controller.signal }))).then(results => {
      if (controller.signal.aborted) return;
      if (results[0].status === "rejected") {
        setState(value => ({ ...value, egresso: null, loading: false, error: errorMessage(results[0].reason) }));
        return;
      }
      const sections = ["cargos", "cursos", "depoimentos"];
      const next = { egresso: results[0].value.data, loading: false, error: "", warnings: [] };
      results.slice(1).forEach((result, index) => {
        const valid = result.status === "fulfilled" && Array.isArray(result.value.data);
        next[sections[index]] = valid ? result.value.data : [];
        if (!valid) next.warnings.push("Não foi possível carregar " + sections[index] + " deste perfil.");
      });
      setState(next);
    });
    return () => controller.abort();
  }, [id, revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
