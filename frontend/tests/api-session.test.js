import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import { resetCsrf } from "../src/services/api.js";

const originalAdapter = axios.defaults.adapter;
const originalWindow = globalThis.window;
const events = new EventTarget();
globalThis.window = { location: { origin: "http://localhost:5180" }, dispatchEvent: events.dispatchEvent.bind(events) };
let calls;
const response = (config, data) => ({ config, data, status: 200, statusText: "OK", headers: {} });
beforeEach(() => { resetCsrf(); calls = []; });
after(() => { axios.defaults.adapter = originalAdapter; if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow; });

test("alterações concorrentes compartilham token e enviam cookies somente à API", async () => {
  axios.defaults.adapter = async config => {
    calls.push(config);
    if (config.url === "/api/auth/csrf") { await new Promise(resolve => setTimeout(resolve, 5)); return response(config, { token: "token-da-sessao" }); }
    return response(config, {});
  };
  await Promise.all([axios.post("/api/gestao/rascunhos", {}), axios.put("/api/egressos/atualizar/egresso/1", {})]);
  assert.equal(calls.filter(c => c.url === "/api/auth/csrf").length, 1);
  for (const config of calls.filter(c => c.method !== "get")) {
    assert.equal(config.headers.get("X-CSRF-TOKEN"), "token-da-sessao");
    assert.equal(config.withCredentials, true);
  }
  await axios.post("https://external.example/api/form", {});
  assert.equal(calls.at(-1).headers.get("X-CSRF-TOKEN"), undefined);
  assert.equal(calls.at(-1).withCredentials, undefined);
  await axios.post("/api/form", {}, { baseURL: "https://external.example" });
  assert.equal(calls.at(-1).headers.get("X-CSRF-TOKEN"), undefined);
  assert.equal(calls.at(-1).withCredentials, undefined);
});

test("renovar a sessão obtém um token novo antes da próxima alteração", async () => {
  let token = "antes-do-login";
  axios.defaults.adapter = async config => { calls.push(config); return response(config, config.url === "/api/auth/csrf" ? { token } : {}); };
  await axios.post("/api/auth/login", {});
  assert.equal(calls.at(-1).headers.get("X-CSRF-TOKEN"), token);
  token = "apos-o-login"; resetCsrf();
  await axios.post("/api/gestao/rascunhos", {});
  assert.equal(calls.at(-1).headers.get("X-CSRF-TOKEN"), token);
  assert.equal(calls.filter(c => c.url === "/api/auth/csrf").length, 2);
});

test("recusa de CSRF não repete a alteração e prepara um novo token para tentar novamente", async () => {
  axios.defaults.adapter = async config => {
    calls.push(config);
    if (config.url === "/api/auth/csrf") return response(config, { token: "seguranca" });
    throw Object.assign(new Error("Recusado"), { config, response: { status: 403, data: {} } });
  };
  await assert.rejects(axios.post("/api/gestao/rascunhos", {}), /Recusado/);
  assert.equal(calls.filter(c => c.method === "post").length, 1);
  await assert.rejects(axios.post("/api/gestao/rascunhos", {}), /Recusado/);
  assert.equal(calls.filter(c => c.url === "/api/auth/csrf").length, 2);
});

test("sessão expirada informa a interface sem disparar o evento para login inválido", async () => {
  let expired = 0;
  const listener = () => { expired += 1; };
  events.addEventListener("portal:session-expired", listener);
  axios.defaults.adapter = async config => {
    if (config.url === "/api/auth/csrf") return response(config, { token: "seguranca" });
    throw Object.assign(new Error("Entre novamente"), { config, response: { status: 401, data: {} } });
  };
  try {
    await assert.rejects(axios.post("/api/auth/login", {}));
    await assert.rejects(axios.get("/api/auth/me"));
    await assert.rejects(axios.get("https://external.example/api/account"));
    assert.equal(expired, 0);
    await assert.rejects(axios.get("/api/gestao/painel"));
    assert.equal(expired, 1);
  } finally { events.removeEventListener("portal:session-expired", listener); }
});
