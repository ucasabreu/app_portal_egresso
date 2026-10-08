import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { errorMessage } from "../utils/presentation.js";
import { loadDirectory, createDirectoryDetailsCache } from "../services/egressoDirectory.js";

export function useEgressoDirectory(filters) {
  const filterKey = JSON.stringify(filters);
  const [revision, setRevision] = useState(0);
  const key = filterKey + ":" + revision;
  const [state, setState] = useState({ key: "", data: [], loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    const get = async path => (await axios.get(API_URL + path, { signal: controller.signal })).data;
    loadDirectory(get, JSON.parse(filterKey))
      .then(data => { if (!controller.signal.aborted) setState({ key, data, loading: false, error: "" }); })
      .catch(error => { if (!controller.signal.aborted) setState({ key, data: [], loading: false, error: errorMessage(error) }); });
    return () => controller.abort();
  }, [filterKey, key]);
  return { ...(state.key === key ? state : { data: [], loading: true, error: "" }), reload: () => setRevision(value => value + 1) };
}

export function useDirectoryDetails(ids) {
  const cache = useRef(null);
  if (!cache.current) cache.current = createDirectoryDetailsCache();
  const idsKey = JSON.stringify(ids);
  const [revision, setRevision] = useState(0);
  const key = idsKey + ":" + revision;
  const [state, setState] = useState({ key: "", entries: {}, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    const get = async path => (await axios.get(API_URL + path, { signal: controller.signal })).data;
    cache.current.load(get, JSON.parse(idsKey)).then(entries => {
      if (!controller.signal.aborted) setState({ key, entries, loading: false });
    });
    return () => controller.abort();
  }, [idsKey, key]);
  const current = state.key === key ? state : { entries: {}, loading: ids.length > 0 };
  return { ...current, hasErrors: Object.values(current.entries).some(entry => Object.keys(entry.errors).length > 0), retry: () => setRevision(value => value + 1), clear: () => cache.current.clear() };
}
