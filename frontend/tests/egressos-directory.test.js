import test from "node:test";
import assert from "node:assert/strict";
import { readDirectory, directorySearch, directoryPage, cardFormation, cardExperience, trajectoryPeriod, directoryReturn } from "../src/utils/egressoDirectory.js";
import { loadDirectory, createDirectoryDetailsCache } from "../src/services/egressoDirectory.js";
import { getCollection } from "../src/services/collections.js";

const problem = (status, data) => Object.assign(new Error(data), { response: { status, data } });
const records = Array.from({ length: 18 }, (_, index) => ({ id_egresso: index + 1, nome: `Pessoa ${index + 1}` }));

test("URL preserva filtros com caracteres especiais, ordem, página e tamanho", () => {
  const view = { filters: { nome: " Ana & João ", curso: "Computação", cargo: "Dev", anoInicio: "2018", anoFim: "2022" }, order: "nome-desc", page: 3, size: 12 };
  const parsed = readDirectory(directorySearch(view));
  assert.deepEqual(parsed, { ...view, filters: { ...view.filters, nome: "Ana & João" } });
  assert.equal(directorySearch(readDirectory("")), "");
});

test("parâmetros inválidos não chegam à consulta e padrões dispensam parâmetros", () => {
  const view = readDirectory("pagina=Infinity&tamanho=1000&ordem=qualquer&anoInicio=abc&anoFim=0000");
  assert.equal(view.page, 1);
  assert.equal(view.size, 6);
  assert.equal(view.order, "nome-asc");
  assert.equal(view.filters.anoInicio, "");
  assert.equal(view.filters.anoFim, "");
  for (const year of ["1899", "2101", "2018.5", "02018"]) assert.equal(readDirectory("anoInicio=" + year).filters.anoInicio, "");
  for (const page of ["0", "-1", "2.5", "9007199254740992"]) assert.equal(readDirectory("pagina=" + page).page, 1);
});

test("ordenação portuguesa e numérica é estável e não altera a coleção", () => {
  const data = [{ id_egresso: 2, nome: "Ána" }, { id_egresso: 1, nome: "Ana" }, { id_egresso: 3, nome: "Bruno" }];
  const view = readDirectory("");
  assert.deepEqual(directoryPage(data, view).items.map(person => person.id_egresso), [1, 2, 3]);
  assert.deepEqual(directoryPage(data, { ...view, order: "nome-desc" }).items.map(person => person.id_egresso), [3, 1, 2]);
  assert.equal(data[0].id_egresso, 2);
  assert.deepEqual(directoryPage(records, view).items.map(person => person.id_egresso), [1, 2, 3, 4, 5, 6]);
});

test("paginação limita páginas fora da faixa e explica resultados vazios", () => {
  const view = readDirectory("pagina=999");
  const page = directoryPage(records, view);
  assert.equal(page.page, 3);
  assert.equal(page.pages, 3);
  assert.equal(page.first, 13);
  assert.equal(page.last, 18);
  assert.equal(page.items.length, 6);
  assert.deepEqual(directoryPage([], view), { items: [], total: 0, page: 1, pages: 1, first: 0, last: 0 });
  assert.equal(directoryPage(records, { ...view, size: 12 }).items.length, 6);
});

test("cartões selecionam formação recente e priorizam experiência em andamento", () => {
  const old = { curso: { nome: "Graduação" }, ano_inicio: 2010, ano_fim: 2014 };
  const latest = { curso: { nome: "Mestrado" }, ano_inicio: 2020, ano_fim: 2022 };
  assert.equal(cardFormation([old, {}, latest]), latest);
  const ongoing = { descricao: "Analista", local: "Empresa", ano_inicio: 2018, ano_fim: null };
  const past = { descricao: "Estágio", ano_inicio: 2023, ano_fim: 2024 };
  assert.equal(cardExperience([past, ongoing]), ongoing);
  assert.equal(cardExperience([{ descricao: "Antigo", ano_inicio: 2000, ano_fim: 2002 }, past]), past);
  assert.equal(cardExperience([{ nome: "Profissão inventada" }]), undefined);
  assert.equal(cardFormation([]), undefined);
  assert.equal(trajectoryPeriod(ongoing), "2018 – Em andamento");
  assert.equal(trajectoryPeriod(latest), "2020 – 2022");
});

test("retorno de perfil aceita somente a rota do diretório", () => {
  assert.equal(directoryReturn("/egressos/listar?curso=Computação&pagina=2"), "/egressos/listar?curso=Computação&pagina=2");
  for (const path of [null, "https://example.test", "//example.test", "/egressos/listar/externo", "/login", "/egressos/listar#x"]) assert.equal(directoryReturn(path), "/egressos/listar");
});

test("consultas combinadas reconhecem IDs textuais e removem registros repetidos", async () => {
  const ana = { id_egresso: 1, nome: "Ana" };
  const data = await loadDirectory(async path => path.includes("/nome?") ? [null, ana, ana, { id_egresso: 2 }] : [{ id_egresso: "1" }], { nome: "Ana", curso: "Computação" });
  assert.deepEqual(data, [ana]);
});

test("cada busca reconhece somente mensagens conhecidas de coleção vazia", async () => {
  const cases = [
    ["", "Não há egressos cadastrados."],
    ["/nome?nome=Ana", "Não há egressos com o nome informado."],
    ["/curso?curso=Computação", "Não há egressos com o curso informado."],
    ["/cargo?cargo=Dev", "Não há egressos com o cargo informado."],
    ["/cargo?cargo=Dev", "Não há cargos cadastrados."],
    ["/ano_inicio?ano=2018", "Não há egressos para o ano informado."],
    ["/ano_fim?ano=2022", "Não há egressos para o ano informado."],
  ];
  for (const [suffix, message] of cases) {
    const path = "/api/consultas/listar/egressos" + suffix;
    assert.deepEqual(await getCollection(async () => { throw problem(400, message); }, path), []);
    assert.deepEqual(await getCollection(async () => { throw problem(400, "Não há egressos cadastrados."); }, path), []);
  }
});

test("validação, autenticação, erro de servidor e formato inválido continuam como falhas", async () => {
  for (const status of [400, 401, 403, 500]) {
    const error = problem(status, status === 400 ? "Nome não pode ser vazio." : "Não há egressos cadastrados.");
    await assert.rejects(loadDirectory(async () => { throw error; }, { nome: "Ana" }), value => value === error);
  }
  await assert.rejects(loadDirectory(async () => ({ data: [] }), {}), /formato inesperado/);
  await assert.rejects(getCollection(async () => { throw problem(400, "Não há egressos cadastrados."); }, "/api/outro"));
});

test("uma consulta válida vazia mantém vazia a interseção dos filtros", async () => {
  assert.deepEqual(await loadDirectory(async path => {
    if (path.includes("/curso?")) throw problem(400, "Não há egressos com o curso informado.");
    return records;
  }, { nome: "Pessoa", curso: "Inexistente" }), []);
});

test("detalhes carregam somente IDs visíveis e reutilizam respostas entre páginas", async () => {
  const calls = [];
  const cache = createDirectoryDetailsCache();
  const get = async path => { calls.push(path); return []; };
  const first = directoryPage(records, readDirectory("")).items.map(person => person.id_egresso);
  await cache.load(get, [...first, "1"]);
  assert.equal(calls.length, 12);
  assert.ok(calls.every(path => first.includes(Number(path.split("/")[4]))));
  await cache.load(get, [1, 2]);
  assert.equal(calls.length, 12);
  await cache.load(get, [7]);
  assert.equal(calls.length, 14);
  cache.clear();
  await cache.load(get, [1]);
  assert.equal(calls.length, 16);
});

test("falha parcial preserva a formação e repete somente a experiência indisponível", async () => {
  const cache = createDirectoryDetailsCache();
  const course = { curso: { nome: "Computação" }, ano_inicio: 2018 };
  let fail = true;
  const calls = [];
  const get = async path => {
    calls.push(path);
    if (path.endsWith("/cargos")) {
      if (fail) throw problem(503, "Experiência indisponível");
      return [];
    }
    return [course];
  };
  const first = await cache.load(get, [1]);
  assert.deepEqual(first[1].cursos, [course]);
  assert.equal(first[1].errors.cargos.response.status, 503);
  fail = false;
  const next = await cache.load(get, [1]);
  assert.equal(calls.length, 3);
  assert.deepEqual(next[1].cursos, [course]);
  assert.deepEqual(next[1].errors, {});
});

test("respostas de detalhe malformadas e canceladas não viram ausência nem entram no cache", async () => {
  const cache = createDirectoryDetailsCache();
  const malformed = await cache.load(async () => ({ unexpected: true }), [1]);
  assert.match(malformed[1].errors.cursos.message, /formato inesperado/);
  const cancelled = await cache.load(async () => { throw Object.assign(new Error("Cancelada"), { code: "ERR_CANCELED" }); }, [1]);
  assert.equal(cancelled[1].errors.cargos.code, "ERR_CANCELED");
  const calls = [];
  const valid = await cache.load(async path => { calls.push(path); return []; }, [1]);
  assert.equal(calls.length, 2);
  assert.deepEqual(valid[1].errors, {});
});

test("atualização impede que respostas antigas repovoem o cache", async () => {
  const cache = createDirectoryDetailsCache();
  const pending = [];
  const old = cache.load(() => new Promise(resolve => pending.push(resolve)), [1]);
  cache.clear();
  pending.forEach(resolve => resolve([{ antigo: true }]));
  await old;
  let calls = 0;
  const updated = await cache.load(async () => { calls += 1; return []; }, [1]);
  assert.equal(calls, 2);
  assert.deepEqual(updated[1].cursos, []);
});
