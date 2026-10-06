import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { readPage } from "../services/pagination.js";
import { errorMessage } from "../utils/presentation.js";

const empty = { items: [], total: 0, page: 1, pages: 1, size: 6, first: 0, last: 0 };
export default function usePagedCollection(path) {
  const [revision, setRevision] = useState(0);
  const key = path + ":" + revision;
  const [state, setState] = useState({ key: "", data: empty, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    axios.get(API_URL + path, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setState({ key, data: readPage(data), loading: false, error: "" }); })
      .catch(error => { if (!controller.signal.aborted) setState({ key, data: empty, loading: false, error: errorMessage(error) }); });
    return () => controller.abort();
  }, [path, key]);
  return { ...(state.key === key ? state : { data: empty, loading: true, error: "" }), retry: () => setRevision(value => value + 1) };
}
