import { profileValues, saveProfileChanges } from "../src/services/profileEditor.js";
import test from "node:test";
import assert from "node:assert/strict";
import { graduateRows, matchesSearch, highlightErrors, profileErrors, courseErrors, trajectoryErrors, draftErrors, coordinatorErrors, graduateSummary, draftResponse } from "../src/utils/management.js";
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

test("payload do perfil contém somente os campos públicos, sem senha ou confirmação", () => {
  const payload = profileValues({ ...profile, senha: "segredo", confirmationPassword: "segredo", foto: null, id_egresso: 7 });
  assert.equal(payload.foto, "");
  assert.equal(payload.nome, "Ana Demo");
  assert.equal(Object.hasOwn(payload, "senha"), false);
  assert.equal(Object.hasOwn(payload, "confirmationPassword"), false);
  assert.equal(Object.hasOwn(payload, "id_egresso"), false);
});

test("perfil salvo e falha de senha são operações com resultados separados", async () => {
  const failure = new Error("Redefinição indisponível");
  const operations = [];
  const result = await saveProfileChanges({ id: 7, values: profile, password: "senha-demo", allowPasswordReset: true,
    updateProfile: async (id, values) => { operations.push(["perfil", id, values.nome]); return { id_egresso: 7 }; },
    resetPassword: async id => { operations.push(["senha", id]); throw failure; },
  });
  assert.deepEqual(operations, [["perfil", 7, "Ana Demo"], ["senha", 7]]);
  assert.equal(result.profileSaved, true);
  assert.equal(result.passwordSaved, false);
  assert.equal(result.passwordError, failure);
});

test("repetir somente a senha não envia o perfil já salvo novamente", async () => {
  let profileCalls = 0;
  const result = await saveProfileChanges({ id: 7, values: profile, password: "senha-demo", allowPasswordReset: true, skipProfile: true,
    updateProfile: async () => { profileCalls++; }, resetPassword: async (id, password) => { assert.equal(id, 7); assert.equal(password, "senha-demo"); },
  });
  assert.equal(profileCalls, 0);
  assert.equal(result.passwordSaved, true);
  assert.equal(result.passwordError, null);
});

test("falha ou identidade inesperada do perfil interrompem a redefinição da senha", async () => {
  let resets = 0;
  const base = { id: 7, values: profile, password: "senha-demo", allowPasswordReset: true, resetPassword: async () => { resets++; } };
  await assert.rejects(saveProfileChanges({ ...base, updateProfile: async () => { throw new Error("Perfil indisponível"); } }), /Perfil indisponível/);
  await assert.rejects(saveProfileChanges({ ...base, updateProfile: async () => ({ id_egresso: 8 }) }), /identificação/);
  assert.equal(resets, 0);
});

test("sem autorização de redefinição, salvar o perfil não envia senha", async () => {
  let resets = 0;
  const result = await saveProfileChanges({ id: 7, values: profile, password: "senha-demo", updateProfile: async () => ({ id_egresso: 7 }), resetPassword: async () => { resets++; } });
  assert.equal(resets, 0);
  assert.equal(result.profileSaved, true);
});

test("rascunho permite texto incompleto e exige limites e URL válidos", () => {
  assert.deepEqual(draftErrors({ titulo: "", feitoDestaque: "", noticia: "", imagem: "" }), {});
  assert.ok(draftErrors({ ...highlight, titulo: "x".repeat(101) }).titulo);
  assert.ok(draftErrors({ ...highlight, noticia: "x".repeat(100001) }).noticia);
  assert.ok(draftErrors({ ...highlight, imagem: "javascript:alert(1)" }).imagem);
  assert.ok(highlightErrors({ ...highlight, noticia: "x".repeat(100001) }).noticia);
});

test("resumo conta pessoas únicas e vínculos separadamente e indica consulta incompleta", () => {
  const courses = [{ egressos: [{ id: 7 }, { id: 8 }] }, { egressos: [{ id: "7" }] }];
  assert.deepEqual(graduateSummary(courses), { people: 2, associations: 3 });
  assert.deepEqual(graduateSummary([...courses, { egressosError: "Indisponível" }]), { people: "Indisponível", associations: "Indisponível" });
  assert.deepEqual(graduateSummary([], true), { people: "Indisponível", associations: "Indisponível" });
});

test("conta de coordenação exige login e senha do contrato e tipo disponível", () => {
  const values = { login: "coord.demo", senha: "senha-demo", tipo: "coordenador" };
  assert.deepEqual(coordinatorErrors(values), {});
  assert.deepEqual(coordinatorErrors({ ...values, tipo: "geral" }), {});
  assert.ok(coordinatorErrors({ ...values, login: "a b" }).login);
  assert.ok(coordinatorErrors({ ...values, senha: "curta" }).senha);
  assert.ok(coordinatorErrors({ ...values, tipo: "administrador" }).tipo);
});

test("resposta do rascunho exige versão confirmada e preserva sua identidade", () => {
  const saved = { id: 12, versao: 3, titulo: "Conquista" };
  assert.equal(draftResponse(saved, "12"), saved);
  assert.equal(draftResponse({ ...saved, versao: 0 }).versao, 0);
  for (const value of [null, { id: 12 }, { ...saved, versao: -1 }, { ...saved, versao: "3" }, { ...saved, id: 13 }]) {
    assert.throws(() => draftResponse(value, 12), /versão do rascunho/);
  }
});
