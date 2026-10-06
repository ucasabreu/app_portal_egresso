import test from "node:test";
import assert from "node:assert/strict";
import { graduateRows, matchesSearch, highlightErrors, profileErrors, courseErrors, trajectoryErrors } from "../src/utils/management.js";
import { MAX_IMAGE_BYTES, imageFileError } from "../src/utils/imagePolicy.js";
import readImageFile from "../src/utils/readImageFile.js";

const highlight = { titulo: "Conquista acadêmica 2026", noticia: "Primeiro parágrafo.\n\nSegundo.", feitoDestaque: "Reconhecimento", imagem: "" };
const profile = { nome: "Ana Demo", email: "ana@example.test", linkedin: "", instagram: "", curriculo: "" };

test("busca administrativa ignora acentos, caixa e espaços externos", () => {
  assert.ok(matchesSearch(" COMPUTACAO ", "Ciência da Computação"));
  assert.ok(matchesSearch("ana@", null, "ana@example.test"));
  assert.ok(matchesSearch("", "Curso"));
  assert.equal(matchesSearch("Maria", "Ana"), false);
});

test("formações mantêm o ID do vínculo mesmo quando a pessoa possui dois cursos", () => {
  const person = { id: 7, nome: "Ana Demo", email: "ana@example.test" };
  const courses = [{ id_curso: 1, nome: "Computação", egressos: [{ ...person, idVinculo: 11 }] }, { id_curso: 2, nome: "Educação", egressos: [{ ...person, idVinculo: 22 }] }];
  assert.deepEqual(graduateRows(courses).map(row => row.idVinculo), [11, 22]);
  assert.equal(new Set(graduateRows(courses).map(row => row.rowKey)).size, 2);
  assert.equal(graduateRows(courses, { courseId: "2", query: "ANA@" })[0].idVinculo, 22);
  assert.equal(graduateRows(courses, { query: "Inexistente" }).length, 0);
});

test("publicação respeita título e conquista aceitos pelo servidor", () => {
  assert.deepEqual(highlightErrors(highlight), {});
  assert.ok(highlightErrors({ ...highlight, titulo: "Conquista!" }).titulo);
  assert.ok(highlightErrors({ ...highlight, titulo: "x".repeat(101) }).titulo);
  assert.ok(highlightErrors({ ...highlight, feitoDestaque: "x".repeat(256) }).feitoDestaque);
  assert.ok(highlightErrors({ ...highlight, noticia: " \n " }).noticia);
  assert.ok(highlightErrors({ ...highlight, imagem: "javascript:alert(1)" }).imagem);
  assert.deepEqual(highlightErrors({ ...highlight, titulo: "x".repeat(100), feitoDestaque: "x".repeat(255), imagem: "https://example.test/photo.jpg" }), {});
});

test("perfil valida campos obrigatórios e domínios das redes sem aceitar imitações", () => {
  assert.deepEqual(profileErrors(profile), {});
  assert.deepEqual(profileErrors({ ...profile, curriculo: "/demo/curriculo.html" }), {});
  assert.deepEqual(profileErrors({ ...profile, linkedin: "https://www.linkedin.com/in/ana", instagram: "https://www.instagram.com/ana", curriculo: "https://example.test/cv.pdf" }), {});
  assert.ok(profileErrors({ ...profile, nome: " " }).nome);
  assert.ok(profileErrors({ ...profile, email: "ana" }).email);
  assert.ok(profileErrors({ ...profile, linkedin: "https://linkedin.com.example.test/ana" }).linkedin);
  assert.ok(profileErrors({ ...profile, instagram: "https://example.test/ana" }).instagram);
  assert.ok(profileErrors({ ...profile, curriculo: "file:///tmp/cv" }).curriculo);
});

test("curso exige responsável disponível e mantém regra atual de nomes", () => {
  const values = { nome: "Computação", nivel: "Graduação", id_coordenador: "2" };
  assert.deepEqual(courseErrors(values, [{ id_coordenador: 2 }]), {});
  assert.ok(courseErrors(values, []).id_coordenador);
  assert.ok(courseErrors({ ...values, nome: "Curso 2" }, [{ id_coordenador: 2 }]).nome);
});

test("formação permite período em andamento e rejeita anos invertidos e cursos indisponíveis", () => {
  const values = { id_curso: "1", ano_inicio: "2020", ano_fim: "" };
  const courses = [{ id_curso: 1 }];
  assert.deepEqual(trajectoryErrors("curso", values, courses, 2026), {});
  assert.ok(trajectoryErrors("curso", { ...values, ano_fim: "2019" }, courses, 2026).ano_fim);
  assert.ok(trajectoryErrors("curso", { ...values, ano_inicio: "2027" }, courses, 2026).ano_inicio);
  assert.ok(trajectoryErrors("curso", values, [], 2026).id_curso);
});

test("experiência e depoimento validam conteúdo e regras reais do ano de início", () => {
  const values = { descricao: "Analista", local: "Empresa Demo", ano_inicio: "2021", ano_fim: "" };
  assert.deepEqual(trajectoryErrors("cargo", values, [], 2026), {});
  assert.ok(trajectoryErrors("cargo", { ...values, ano_inicio: "1990" }, [], 2026).ano_inicio);
  assert.ok(trajectoryErrors("cargo", { ...values, local: " " }, [], 2026).local);
  assert.ok(trajectoryErrors("depoimento", { texto: " \n " }).texto);
  assert.deepEqual(trajectoryErrors("depoimento", { texto: "Texto simples." }), {});
});

test("arquivos aceitos respeitam o limite inclusivo de 2 MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) assert.equal(imageFileError({ type, size: MAX_IMAGE_BYTES }), "");
  assert.ok(imageFileError({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }));
  assert.ok(imageFileError({ type: "image/png", size: 0 }));
  assert.ok(imageFileError({ type: "image/svg+xml", size: 50 }));
  assert.ok(imageFileError({ type: "text/plain", size: 50 }));
});

test("leitura rejeita imagem grande ou formato inválido antes de instanciar FileReader", async () => {
  await assert.rejects(readImageFile({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }), /2 MB/);
  await assert.rejects(readImageFile({ type: "image/svg+xml", size: 50 }), /JPEG/);
});
