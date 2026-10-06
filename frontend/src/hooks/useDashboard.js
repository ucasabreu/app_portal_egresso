import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { errorMessage } from "../utils/presentation";
import { loadDashboard } from "../services/dashboard.js";

const initialState = { coordenador: null, coordenadores: [], cursos: [], destaques: [], sections: {}, loading: true, error: "" };

export default function useDashboard(id, general = false) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState(initialState);
  useEffect(() => {
    const controller = new AbortController();
    const get = async path => (await axios.get(API_URL + path, { signal: controller.signal })).data;
    const load = async () => {
      setState(initialState);
      try {
        const data = await loadDashboard(get, id, general);
        if (!controller.signal.aborted) setState({ ...data, loading: false, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setState(value => ({ ...value, loading: false, error: errorMessage(error) }));
      }
    };
    load();
    return () => controller.abort();
  }, [id, general, revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
