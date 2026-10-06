// Vite e Nginx encaminham /api para o backend no ambiente correspondente.
import axios from "axios";
export const API_URL = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');

let csrf;
let csrfRequest;
let generation = 0;
export function resetCsrf() { generation += 1; csrf = undefined; csrfRequest = undefined; }

function isPortalRequest(config) {
  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const api = new URL(API_URL || "/", origin);
  const url = new URL(config?.url || "", new URL(config?.baseURL || "/", origin));
  return url.origin === api.origin && url.pathname.startsWith(api.pathname.replace(/\/$/, "") + "/api/");
}

axios.interceptors.request.use(async config => {
  if (!isPortalRequest(config)) return config;
  config.withCredentials = true;
  if (!["get", "head", "options"].includes((config.method || "get").toLowerCase())) {
    if (!csrf) {
      if (!csrfRequest) {
        const version = generation;
        csrfRequest = axios.get(API_URL + "/api/auth/csrf").then(({ data }) => {
          if (typeof data?.token !== "string" || !data.token) throw new Error("Não foi possível preparar a sessão de segurança.");
          if (version === generation) csrf = data.token;
          return data.token;
        }).finally(() => { if (version === generation) csrfRequest = undefined; });
      }
      config.headers.set("X-CSRF-TOKEN", await csrfRequest);
    } else config.headers.set("X-CSRF-TOKEN", csrf);
  }
  return config;
});

axios.interceptors.response.use(response => response, error => {
  if (isPortalRequest(error.config) && error.response?.status === 401 && typeof window !== "undefined" && !/\/api\/auth\/(login|me)$/.test(error.config?.url || "")) {
    resetCsrf(); window.dispatchEvent(new Event("portal:session-expired"));
  }
  // Never retry a write automatically: the original operation may already have completed.
  if (isPortalRequest(error.config) && error.response?.status === 403) resetCsrf();
  return Promise.reject(error);
});
