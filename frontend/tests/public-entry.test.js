import test from "node:test";
import assert from "node:assert/strict";
import { orderedDepoimentos, depoimentoExcerpt, depoimentoYear, depoimentosPath } from "../src/utils/depoimentos.js";
import { homeContent, homeStatistics } from "../src/utils/homeContent.js";
import { getCollection } from "../src/services/collections.js";

const problem = (status, data) => Object.assign(new Error(data), { response: { status, data } });

test("depoimentos são ordenados por data e deduplicados por ID textual ou numérico", () => {
  const old = { id_depoimento: 1, data: "2025-01-01", texto: "Antigo" };
  const recent = { id_depoimento: 2, data: "2026-10-06", texto: "Recente" };
  const unknown = { id_depoimento: 3, data: "inválida" };
  const input = [unknown, old, recent, { ...recent, id_depoimento: "2" }, null, {}];
  assert.deepEqual(orderedDepoimentos(input), [recent, old, unknown]);
  assert.equal(input[0], unknown);
});

test("datas ausentes ficam por último e datas iguais preservam a ordem", () => {
  const first = { id_depoimento: 1, data: "2026-10-06" };
  const same = { id_depoimento: 2, data: "2026-10-06" };
  const absent = { id_depoimento: 3 };
  assert.deepEqual(orderedDepoimentos([absent, same, first]), [same, first, absent]);
});

test("relatos curtos e vazios não exigem expansão nem transformam texto simples em HTML", () => {
  assert.deepEqual(depoimentoExcerpt(" Memória.\n\nOutro parágrafo. "), { text: "Memória.\n\nOutro parágrafo.", preview: "Memória.\n\nOutro parágrafo.", truncated: false });
  for (const value of [null, undefined, {}, "  "]) assert.deepEqual(depoimentoExcerpt(value), { text: "", preview: "", truncated: false });
  assert.equal(depoimentoExcerpt("<b>Relato</b>").text, "<b>Relato</b>");
});

test("relatos longos preservam o conteúdo completo e usam um resumo com limite", () => {
  const text = "Uma memória da universidade. ".repeat(30).trim();
  const result = depoimentoExcerpt(text);
  assert.equal(result.text, text);
  assert.equal(result.truncated, true);
  assert.ok(result.preview.length <= 281);
  assert.ok(result.preview.endsWith("…"));
  assert.ok(text.startsWith(result.preview.slice(0, -1)));
});

test("resumos preservam caracteres Unicode sem dividir emojis", () => {
  const result = depoimentoExcerpt("🎓".repeat(300));
  assert.equal(result.preview, "🎓".repeat(280) + "…");
  assert.equal(result.text, "🎓".repeat(300));
});

test("ano de publicação normaliza espaços e rejeita parâmetros inválidos", () => {
  assert.equal(depoimentoYear(" 2026 "), "2026");
  for (const value of [null, "", "-1", "0", "abc", "20", "2026.5", "1899", "2101", "02026"]) assert.equal(depoimentoYear(value), "");
  assert.equal(depoimentoYear("1900"), "1900");
  assert.equal(depoimentoYear("2100"), "2100");
});

test("a prévia usa o limite do servidor e a busca por ano mantém o contrato existente", () => {
  assert.equal(depoimentosPath(), "/api/consultas/listar/depoimentos");
  assert.equal(depoimentosPath("", 3), "/api/consultas/listar/depoimentos/limite?limite=3");
  assert.equal(depoimentosPath("2026", 3), "/api/consultas/listar/depoimentos/ano?ano=2026");
  for (const limit of [0, -1, 1.5, "3", null]) assert.equal(depoimentosPath("inválido", limit), "/api/consultas/listar/depoimentos");
});

test("página inicial limita conteúdo real e não acrescenta notícias institucionais", () => {
  const destaques = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, titulo: `Conquista ${index + 1}`, dataPublicacao: `2026-10-${String(index + 1).padStart(2, "0")}` }));
  const egressos = Array.from({ length: 10 }, (_, index) => ({ id_egresso: index + 1, nome: `Pessoa ${index + 1}` })).reverse();
  const depoimentos = Array.from({ length: 10 }, (_, index) => ({ id_depoimento: index + 1, data: `2026-10-${String(index + 1).padStart(2, "0")}` }));
  const result = homeContent({ destaques: [...destaques, destaques[0]], egressos: [...egressos, egressos[0]], depoimentos });
  assert.deepEqual(result.stories.map(item => item.id), [10, 9, 8, 7, 6, 5]);
  assert.deepEqual(result.people.map(item => item.id_egresso), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(result.testimonials.map(item => item.id_depoimento), [10, 9, 8]);
  assert.equal(egressos[0].id_egresso, 10);
});

test("coleções vazias na entrada continuam vazias, sem números ou conteúdo inventado", () => {
  assert.deepEqual(homeContent({}), { stories: [], people: [], testimonials: [] });
  const result = homeContent({ egressos: [{ id_egresso: 1, nome: "Ana" }] });
  assert.equal(result.people.length, 1);
  assert.deepEqual(result.stories, []);
  assert.deepEqual(result.testimonials, []);
});

test("todos os endpoints de relatos reconhecem somente as ausências conhecidas", async () => {
  for (const path of [depoimentosPath(), depoimentosPath("", 3), depoimentosPath("2026")]) {
    assert.deepEqual(await getCollection(async () => { throw problem(400, "Não há depoimentos cadastrados."); }, path), []);
  }
  assert.deepEqual(await getCollection(async () => { throw problem(400, "Não há depoimentos para o ano informado."); }, depoimentosPath("2026")), []);
  await assert.rejects(getCollection(async () => { throw problem(400, "Não há depoimentos para o ano informado."); }, depoimentosPath()));
});

test("validação de ano/limite, autenticação e falhas de servidor continuam como erros", async () => {
  const cases = [
    [400, "O ano não pode ser nulo.", depoimentosPath("2026")],
    [400, "O ano deve ser maior que zero.", depoimentosPath("2026")],
    [400, "Valor limite deve ser válido.", depoimentosPath("", 3)],
    [401, "Não há depoimentos cadastrados.", depoimentosPath()],
    [500, "Não há depoimentos cadastrados.", depoimentosPath()],
  ];
  for (const [status, message, path] of cases) {
    const error = problem(status, message);
    await assert.rejects(getCollection(async () => { throw error; }, path), value => value === error);
  }
});

test("resposta malformada dos relatos não é apresentada como lista vazia", async () => {
  await assert.rejects(getCollection(async () => ({ texto: "Formato incorreto" }), depoimentosPath()), /formato inesperado/);
});


test("contagens da home usam totais da API, incluindo zero, sem contar apenas a prévia", () => {
  const community = { data: { total: 125, items: [{ id: 1 }] }, loading: false, error: "" };
  const stories = { data: { total: 0, items: [] }, loading: false, error: "" };
  assert.deepEqual(homeStatistics({ community, stories }), [
    { label: "Egressos na comunidade", value: 125 },
    { label: "Histórias publicadas", value: 0 },
  ]);
});

test("contagens ausentes, pendentes ou com falha não viram métricas fictícias", () => {
  assert.deepEqual(homeStatistics(), []);
  for (const collection of [
    { data: { total: 20 }, loading: true },
    { data: { total: 20 }, loading: false, error: "Indisponível" },
    { data: { total: "20" }, loading: false },
    { data: { total: -1 }, loading: false },
    { data: { total: 1.5 }, loading: false },
    { data: { total: Number.MAX_SAFE_INTEGER + 1 }, loading: false },
    {},
  ]) assert.deepEqual(homeStatistics({ community: collection, stories: collection }), []);
});
