import test from "node:test";
import assert from "node:assert/strict";
import { getCollection } from "../src/services/collections.js";
import { loadProfile } from "../src/services/profile.js";
import { orderedDestaques, groupDestaques } from "../src/utils/destaques.js";
import { loadDestaque } from "../src/services/destaques.js";

const failure = (status, data) => Object.assign(new Error("Falha de consulta"), { response: { status, data } });
const graduate = { id_egresso: 1, nome: "Ana" };
const newest = { id: 2, titulo: "Conquista recente", dataPublicacao: "2026-10-06", egresso: graduate };
const oldest = { id: 1, titulo: "Primeira conquista", dataPublicacao: "2025-01-12", egresso: graduate };

test("remove publicações repetidas pelos vínculos de curso e ordena sem alterar a resposta", () => {
  const records = [oldest, newest, { ...newest, id: "2" }, {}, null];
  assert.deepEqual(orderedDestaques(records), [newest, oldest]);
  assert.deepEqual(orderedDestaques(records, "antigos"), [oldest, newest]);
  assert.equal(records.length, 5);
  assert.equal(records[0], oldest);
});

test("datas ausentes ou inválidas ficam depois das datas conhecidas nas duas ordenações", () => {
  const noDate = { id: 3 }, invalid = { id: 4, dataPublicacao: "invalida" };
  assert.deepEqual(orderedDestaques([noDate, newest, invalid, oldest]), [newest, oldest, noDate, invalid]);
  assert.deepEqual(orderedDestaques([noDate, newest, invalid, oldest], "antigos"), [oldest, newest, noDate, invalid]);
});

test("agrupa o histórico por ano e mantém grupo explícito para datas ausentes", () => {
  const missing = { id: 3 };
  assert.deepEqual(groupDestaques([oldest, missing, newest, newest]), [
    { year: "2026", destaques: [newest] }, { year: "2025", destaques: [oldest] },
    { year: "Data não informada", destaques: [missing] },
  ]);
});

test("a coleção vazia do contrato legado é reconhecida inclusive com filtro", async () => {
  const get = async () => { throw failure(400, "Não há destaques cadastrados."); };
  assert.deepEqual(await getCollection(get, "/api/coordenadores/destaque/listar"), []);
  assert.deepEqual(await getCollection(get, "/api/coordenadores/destaque/listar?nome=Ana"), []);
});

test("não mascara falha do serviço, autorização ou ausência em outro endpoint", async () => {
  for (const [status, path] of [[500, "/api/coordenadores/destaque/listar"], [401, "/api/coordenadores/destaque/listar"], [400, "/api/desconhecido"]]) {
    await assert.rejects(getCollection(async () => { throw failure(status, "Não há destaques cadastrados."); }, path));
  }
  await assert.rejects(getCollection(async () => ({ lista: [] }), "/api/coordenadores/destaque/listar"), /formato inesperado/);
});

test("artigo consulta pelo ID da publicação, preservando texto simples", async () => {
  const article = { ...newest, noticia: "Primeiro parágrafo.\n\nSegundo parágrafo. <b>Texto</b>" };
  const result = await loadDestaque(async path => {
    assert.equal(path, "/api/coordenadores/buscar/destaque/2");
    return article;
  }, "2");
  assert.equal(result, article);
});

test("IDs inválidos não geram consulta e uma lista não é aceita como artigo", async () => {
  let calls = 0;
  const get = async () => { calls += 1; return [newest]; };
  await assert.rejects(loadDestaque(get, "../../outro"), /endereço/);
  assert.equal(calls, 0);
  await assert.rejects(loadDestaque(get, 2), /formato inesperado/);
  await assert.rejects(loadDestaque(async () => oldest, 2), /formato inesperado/);
});

test("publicação inexistente e falha do servidor preservam seus erros", async () => {
  for (const status of [404, 500]) {
    const error = failure(status, "Publicação indisponível");
    await assert.rejects(loadDestaque(async () => { throw error; }, 2), value => value === error);
  }
});

function profileFixture(overrides = {}) {
  const records = {
    "/api/egressos/buscar/egresso/1": graduate,
    "/api/egressos/egresso/1/cargos": [{ descricao: "Desenvolvedora" }],
    "/api/egressos/egresso/1/cursos_egresso": [{ curso: { nome: "Computação" } }],
    "/api/egressos/egresso/1/depoimentos": [],
    "/api/coordenadores/destaque/egresso/1": [oldest, newest, newest], ...overrides,
  };
  return async path => {
    if (records[path] instanceof Error) throw records[path];
    return records[path];
  };
}

test("perfil público incorpora conquistas ordenadas e sem duplicatas", async () => {
  const result = await loadProfile(profileFixture(), 1, true);
  assert.equal(result.egresso, graduate);
  assert.deepEqual(result.destaques, [newest, oldest]);
  assert.deepEqual(result.sections, {});
});

test("falha nas conquistas preserva a identidade, formação e experiência", async () => {
  const result = await loadProfile(profileFixture({ "/api/coordenadores/destaque/egresso/1": failure(503, "Conquistas indisponíveis") }), 1, true);
  assert.equal(result.egresso, graduate);
  assert.equal(result.cursos.length, 1);
  assert.equal(result.cargos.length, 1);
  assert.equal(result.sections.destaques, "Conquistas indisponíveis");
});

test("coleção vazia e coleção inválida do perfil recebem estados diferentes", async () => {
  const empty = await loadProfile(profileFixture({ "/api/coordenadores/destaque/egresso/1": [] }), 1, true);
  assert.deepEqual(empty.destaques, []);
  assert.deepEqual(empty.sections, {});
  const invalid = await loadProfile(profileFixture({ "/api/egressos/egresso/1/cargos": {} }), 1, true);
  assert.match(invalid.sections.cargos, /formato inesperado/);
});

test("perfil inexistente ou payload inválido não se torna uma trajetória vazia", async () => {
  await assert.rejects(loadProfile(profileFixture({ "/api/egressos/buscar/egresso/1": failure(404, "Egresso não encontrado") }), 1, true));
  await assert.rejects(loadProfile(profileFixture({ "/api/egressos/buscar/egresso/1": {} }), 1, true), /formato inesperado/);
});

test("gestão do egresso conserva suas consultas sem buscar destaques adicionais", async () => {
  const get = profileFixture();
  const result = await loadProfile(async path => {
    assert.ok(!path.includes("destaque"));
    return get(path);
  }, 1);
  assert.deepEqual(result.destaques, []);
  assert.equal(result.cursos.length, 1);
});
