import test from "node:test";
import assert from "node:assert/strict";
import { egressoQueries, intersectEgressos } from "../src/utils/egressoFilters.js";
import { formatDate, errorMessage } from "../src/utils/presentation.js";

test("combina os resultados dos filtros, preserva a ordem e remove duplicatas", () => {
  const ana = { id_egresso: 1, nome: "Ana" };
  const bruno = { id_egresso: 2, nome: "Bruno" };
  assert.deepEqual(intersectEgressos([[ana, bruno, ana], [bruno, ana], [ana]]), [ana]);
  assert.deepEqual(intersectEgressos([[ana, bruno], []]), []);
  assert.deepEqual(intersectEgressos([[{}, ana, ana]]), [ana]);
});

test("limpar os filtros retorna a consulta completa; nomes especiais são codificados", () => {
  assert.deepEqual(egressoQueries({ nome: "  " }), ["/api/consultas/listar/egressos"]);
  const queries = egressoQueries({ nome: " Ana & João ", anoInicio: "2018", anoFim: "2022" });
  assert.equal(queries.length, 3);
  assert.equal(new URL(queries[0], "http://localhost").searchParams.get("nome"), "Ana & João");
  assert.ok(queries[1].endsWith("ano_inicio?ano=2018"));
  assert.ok(queries[2].endsWith("ano_fim?ano=2022"));
});

test("datas sem horário mantêm o dia e valores ausentes não exibem Invalid Date", () => {
  assert.equal(formatDate("2026-10-06"), "06/10/2026");
  assert.equal(formatDate(null), "Data não informada");
  assert.equal(formatDate("invalida"), "Data não informada");
});

test("mensagens da API podem ser texto ou mapas de validação", () => {
  assert.equal(errorMessage({ response: { data: "Login incorreto" } }), "Login incorreto");
  assert.equal(errorMessage({ response: { data: { nome: "Nome obrigatório", email: "E-mail inválido" } } }), "Nome obrigatório E-mail inválido");
  assert.match(errorMessage({ request: {} }), /serviço está disponível/);
});
