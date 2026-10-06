import test from "node:test";
import assert from "node:assert/strict";
import { loadDashboard } from "../src/services/dashboard.js";

const coordinator = { id_coordenador: 2, login: "coord.demo" };
const course = { id_curso: 10, nome: "Computação", coordenador: coordinator };
const otherCourse = { id_curso: 20, nome: "Outro curso", coordenador: { id_coordenador: 3 } };
const graduate = { id_egresso: 1, nome: "Ana", email: "ana@example.com" };
const highlight = { id: 5, coordenador: coordinator, egresso: graduate };
const paths = {
  account: "/api/coordenadores/buscar/coordenador/2",
  courses: "/api/consultas/listar/cursos",
  highlights: "/api/coordenadores/destaque/listar",
  coordinators: "/api/consultas/listar/coordenadores",
  graduates: "/api/coordenadores/coordenador/10/egressos_curso",
};
const failure = (status, data) => Object.assign(new Error("Falha na consulta"), { response: { status, data } });
function fixture(overrides = {}) {
  const responses = {
    [paths.account]: coordinator, [paths.courses]: [course, otherCourse],
    [paths.highlights]: [highlight, { id: 6, coordenador: { id_coordenador: 3 } }],
    [paths.coordinators]: [coordinator, { id_coordenador: 3, login: "outro" }],
    [paths.graduates]: [{ egresso: graduate, ano_inicio: 2018, ano_fim: 2022 }], ...overrides,
  };
  return async path => {
    assert.ok(Object.hasOwn(responses, path), "Consulta inesperada: " + path);
    if (responses[path] instanceof Error) throw responses[path];
    return responses[path];
  };
}

test("mantém apenas cursos e destaques da conta e traduz os vínculos de formação", async () => {
  const result = await loadDashboard(fixture(), 2);
  assert.deepEqual(result.cursos.map(item => item.id_curso), [10]);
  assert.deepEqual(result.destaques.map(item => item.id), [5]);
  assert.deepEqual(result.cursos[0].egressos, [{ id: 1, nome: "Ana", email: "ana@example.com", anoInicio: 2018, anoFim: 2022 }]);
  assert.deepEqual(result.sections, {});
});

test("a ausência de destaques no contrato atual não esconde cursos nem egressos", async () => {
  const result = await loadDashboard(fixture({ [paths.highlights]: failure(400, "Não há destaques cadastrados.") }), 2);
  assert.equal(result.cursos.length, 1);
  assert.equal(result.cursos[0].egressos.length, 1);
  assert.deepEqual(result.destaques, []);
  assert.deepEqual(result.sections, {});
});

test("uma falha real de destaques fica na seção correspondente", async () => {
  const result = await loadDashboard(fixture({ [paths.highlights]: failure(503, "Serviço indisponível") }), 2);
  assert.equal(result.sections.destaques, "Serviço indisponível");
  assert.equal(result.cursos[0].egressos.length, 1);
});

test("curso indisponível não impede a exibição dos destaques", async () => {
  const result = await loadDashboard(fixture({ [paths.courses]: failure(500, "Erro de consulta") }), 2);
  assert.equal(result.sections.cursos, "Erro de consulta");
  assert.equal(result.destaques.length, 1);
});

test("falha em um curso preserva os demais cursos, egressos e destaques", async () => {
  const second = { ...course, id_curso: 11 };
  const result = await loadDashboard(fixture({
    [paths.courses]: [course, second], [paths.graduates]: failure(500, "Falha nos vínculos"),
    "/api/coordenadores/coordenador/11/egressos_curso": [{ egresso: graduate }],
  }), 2);
  assert.equal(result.cursos[0].egressosError, "Falha nos vínculos");
  assert.equal(result.cursos[1].egressos.length, 1);
  assert.equal(result.destaques.length, 1);
});

test("conta sem vínculos recebe listas vazias sem herdar dados de outra conta", async () => {
  const result = await loadDashboard(fixture({ [paths.account]: { id_coordenador: 9 } }), 2);
  assert.deepEqual(result.cursos, []);
  assert.deepEqual(result.destaques, []);
  assert.deepEqual(result.sections, {});
});

test("IDs numéricos e textuais identificam o mesmo responsável", async () => {
  const result = await loadDashboard(fixture({ [paths.account]: { id_coordenador: "2" } }), 2);
  assert.equal(result.cursos.length, 1);
  assert.equal(result.destaques.length, 1);
});

test("não transforma outros erros 400 nem falhas de autorização em lista vazia", async () => {
  for (const error of [failure(400, "Consulta inválida"), failure(401, "Não há destaques cadastrados.")]) {
    const result = await loadDashboard(fixture({ [paths.highlights]: error }), 2);
    assert.ok(result.sections.destaques);
  }
});

test("payload inválido de coleção gera erro local", async () => {
  const result = await loadDashboard(fixture({ [paths.courses]: { cursos: [] } }), 2);
  assert.match(result.sections.cursos, /formato inesperado/);
  assert.equal(result.destaques.length, 1);
});

test("conta inválida ou indisponível impede carregar o painel", async () => {
  await assert.rejects(loadDashboard(fixture({ [paths.account]: {} }), 2), /identificar/);
  await assert.rejects(loadDashboard(fixture({ [paths.account]: failure(404, "Conta não encontrada") }), 2));
});

test("coordenação geral mantém cursos mesmo quando a lista de contas falha", async () => {
  const result = await loadDashboard(fixture({ [paths.coordinators]: failure(500, "Erro nas contas") }), 2, true);
  assert.equal(result.cursos.length, 2);
  assert.equal(result.sections.coordenadores, "Erro nas contas");
});

test("coordenação geral mantém contas quando ainda não existem cursos", async () => {
  const result = await loadDashboard(fixture({ [paths.courses]: failure(400, "Não há cursos cadastrados.") }), 2, true);
  assert.deepEqual(result.cursos, []);
  assert.equal(result.coordenadores.length, 1);
  assert.deepEqual(result.sections, {});
});
