import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { errorMessage } from "../utils/presentation.js";
import { loadDestaque } from "../services/destaques.js";

export default function useDestaque(id) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: "", notFound: false });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: "", notFound: false });
    const get = async path => (await axios.get(API_URL + path, { signal: controller.signal })).data;
    loadDestaque(get, id).then(data => {
      if (!controller.signal.aborted) setState({ data, loading: false, error: "", notFound: false });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ data: null, loading: false, error: errorMessage(error), notFound: error.response?.status === 404 });
    });
    return () => controller.abort();
  }, [id, revision]);
  return { ...state, retry: () => setRevision(value => value + 1) };
}
