import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { errorMessage } from "../utils/presentation";
import { loadProfile } from "../services/profile.js";

const initial = { egresso: null, cargos: [], cursos: [], depoimentos: [], destaques: [], sections: {}, warnings: [], loading: true, error: "" };

export default function useProfile(id, includeDestaques = false) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState(initial);
  useEffect(() => {
    const controller = new AbortController();
    setState(initial);
    const get = async path => (await axios.get(API_URL + path, { signal: controller.signal })).data;
    loadProfile(get, id, includeDestaques).then(data => {
      if (!controller.signal.aborted) setState({ ...data, loading: false, error: "" });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ ...initial, loading: false, error: errorMessage(error) });
    });
    return () => controller.abort();
  }, [id, includeDestaques, revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
