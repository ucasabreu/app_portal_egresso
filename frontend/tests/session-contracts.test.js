import test from "node:test";
import assert from "node:assert/strict";
import { accountPath, canEditProfile, loginDestination } from "../src/auth/AuthContext.js";
import { readPage } from "../src/services/pagination.js";
import { loadDashboardSummary } from "../src/services/dashboard.js";

test("cada papel chega à sua área e visitantes chegam ao login", () => {
  assert.equal(accountPath({ id: 4, role: "egresso" }), "/egresso/4");
  assert.equal(accountPath({ id: 2, role: "coordenador" }), "/coordenador/2");
  assert.equal(accountPath({ id: 1, role: "geral" }), "/coordenador_geral/1");
  assert.equal(accountPath(null), "/login");
});

test("o acesso ao editor respeita propriedade e papel da conta", () => {
  assert.equal(canEditProfile({ id: 4, role: "egresso" }, "4"), true);
  assert.equal(canEditProfile({ id: 4, role: "egresso" }, 5), false);
  assert.equal(canEditProfile({ id: 4, role: "coordenador" }, 4), false);
  assert.equal(canEditProfile({ id: 1, role: "geral" }, 5), true);
  assert.equal(Boolean(canEditProfile(null, 5)), false);
});

const page = { items: [{ id: 2 }], total: 3, page: 2, pages: 3, size: 1, first: 2, last: 2 };
test("preserva a página do servidor e reconhece resultados vazios", () => {
  assert.equal(readPage(page), page);
  assert.deepEqual(readPage({ items: [], total: 0, page: 1, pages: 1, size: 6, first: 0, last: 0 }).items, []);
});

test("rejeita páginas inválidas sem apresentá-las como consulta vazia", () => {
  for (const data of [null, [], { ...page, items: {} }, { ...page, total: -1 }, { ...page, page: 0 }, { ...page, pages: 1 }, { ...page, size: 0 }, { ...page, items: [1, 2] }, { ...page, first: 0 }, { ...page, last: 4 }, { ...page, size: 101 }, { ...page, pages: 4 }]) {
    assert.throws(() => readPage(data), /formato inesperado/);
  }
});

const dashboard = { coordenador: { id_coordenador: 2, tipo: "coordenador" }, cursos: [], coordenadores: [], destaques: [], sections: {}, stats: { egressos: 0 } };
test("o painel agregado é carregado com uma consulta e a identidade esperada", async () => {
  const paths = [];
  assert.equal(await loadDashboardSummary(async path => { paths.push(path); return dashboard; }, "2"), dashboard);
  assert.deepEqual(paths, ["/api/gestao/painel"]);
});

test("não mistura painéis de outras contas ou papéis", async () => {
  await assert.rejects(loadDashboardSummary(async () => dashboard, 3), /desta conta/);
  await assert.rejects(loadDashboardSummary(async () => dashboard, 2, true), /desta conta/);
  await assert.rejects(loadDashboardSummary(async () => ({ ...dashboard, cursos: null }), 2), /desta conta/);
});

test("falhas de sessão e permissão não acionam consultas alternativas", async () => {
  for (const status of [401, 403]) {
    let calls = 0;
    const error = Object.assign(new Error("Acesso recusado"), { response: { status } });
    await assert.rejects(loadDashboardSummary(async () => { calls += 1; throw error; }, 2), error);
    assert.equal(calls, 1);
  }
});

test("falha do resumo agregado recupera seções independentes sem ocultar erros", async () => {
  const records = {
    "/api/coordenadores/buscar/coordenador/2": dashboard.coordenador,
    "/api/consultas/listar/cursos": [],
  };
  const result = await loadDashboardSummary(async path => {
    if (path === "/api/gestao/painel") throw Object.assign(new Error("Resumo indisponível"), { response: { status: 503 } });
    if (path === "/api/coordenadores/destaque/listar") throw new Error("Publicações indisponíveis");
    return records[path];
  }, 2);
  assert.equal(result.coordenador, dashboard.coordenador);
  assert.deepEqual(result.cursos, []);
  assert.equal(result.sections.destaques, "Publicações indisponíveis");
});

test("login retorna apenas ao perfil próprio e preserva o destino por papel", () => {
  const egresso = { id: 7, role: "egresso" };
  assert.equal(loginDestination(egresso, "/edit-egresso/7"), "/edit-egresso/7");
  for (const target of ["/edit-egresso/8", "https://example.test", "//example.test", "/coordenador_geral/1"]) assert.equal(loginDestination(egresso, target), "/egresso/7");
  assert.equal(loginDestination({ id: 2, role: "coordenador" }, "/egresso/7"), "/coordenador/2");
  assert.equal(loginDestination({ id: 1, role: "geral" }, "/edit-egresso/7"), "/coordenador_geral/1");
});
