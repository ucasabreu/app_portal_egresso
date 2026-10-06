import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { errorMessage } from "../utils/presentation.js";
import { getCollection } from "../services/collections.js";

export default function useCollection(path) {
  const [state, setState] = useState({ data: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: [], loading: true, error: "" });
    const get = async url => (await axios.get(API_URL + url, { signal: controller.signal })).data;
    getCollection(get, path)
      .then(data => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: "" });
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setState({ data: [], loading: false, error: errorMessage(error) });
        }
      });
    return () => controller.abort();
  }, [path, revision]);

  return { ...state, retry: () => setRevision(value => value + 1) };
}
