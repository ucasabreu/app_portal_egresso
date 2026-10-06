import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { API_URL, resetCsrf } from "../services/api.js";
import { AuthContext } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sessionRequest = useRef(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    sessionRequest.current?.abort();
    const controller = new AbortController(); sessionRequest.current = controller;
    try { const response = await axios.get(API_URL + "/api/auth/me", { signal: controller.signal }); if (!controller.signal.aborted) setUser(response.data); }
    catch (error) { if (!controller.signal.aborted) { setUser(null); if (error.response?.status !== 401) setError("Não foi possível verificar sua sessão. Tente novamente."); } }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const expired = () => { sessionRequest.current?.abort(); setLoading(false); setUser(null); resetCsrf(); };
    window.addEventListener("portal:session-expired", expired);
    return () => { sessionRequest.current?.abort(); window.removeEventListener("portal:session-expired", expired); };
  }, [refresh]);
  const login = useCallback(async credentials => {
    sessionRequest.current?.abort(); setLoading(false);
    resetCsrf();
    const { data } = await axios.post(API_URL + "/api/auth/login", credentials);
    resetCsrf(); setUser(data); setError(""); return data;
  }, []);
  const register = useCallback(async values => {
    sessionRequest.current?.abort(); setLoading(false);
    const { data } = await axios.post(API_URL + "/api/auth/register", values);
    resetCsrf(); setUser(data); setError(""); return data;
  }, []);
  const logout = useCallback(async () => {
    sessionRequest.current?.abort();
    await axios.post(API_URL + "/api/auth/logout"); resetCsrf(); setUser(null); setLoading(false); setError("");
  }, []);
  const value = useMemo(() => ({ user, loading, error, refresh, login, register, logout }), [user, loading, error, refresh, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
