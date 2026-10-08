export const normalizeSearch = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
export const matchesSearch = (term, ...values) => values.some(value => normalizeSearch(value).includes(normalizeSearch(term)));

export function graduateRows(courses, { query = "", courseId = "" } = {}) {
  return courses.filter(course => !courseId || String(course.id_curso) === String(courseId)).flatMap(course =>
    (course.egressos || []).filter(person => matchesSearch(query, person.nome, person.email)).map((person, index) => ({
      ...person, courseId: course.id_curso, courseName: course.nome,
      rowKey: `${course.id_curso}:${person.idVinculo ?? person.id}:${index}`,
    })));
}

export function highlightErrors(values) {
  const errors = {};
  if (!values.titulo.trim()) errors.titulo = "Informe o título da publicação.";
  else if (values.titulo.length > 100) errors.titulo = "Use no máximo 100 caracteres.";
  else if (!/^[A-Za-zÀ-ÿ0-9\s]+$/.test(values.titulo)) errors.titulo = "Use somente letras, números e espaços, conforme a regra atual do portal.";
  if (!values.noticia.trim()) errors.noticia = "Escreva o texto da notícia.";
  else if (values.noticia.length > 100_000) errors.noticia = "Use no máximo 100.000 caracteres.";
  if (!values.feitoDestaque.trim()) errors.feitoDestaque = "Descreva a conquista reconhecida.";
  else if (values.feitoDestaque.length > 255) errors.feitoDestaque = "Resuma a conquista em até 255 caracteres.";
  if (values.imagem && (!httpUrl(values.imagem) || values.imagem.length > 2048 || new URL(values.imagem).username || new URL(values.imagem).password)) errors.imagem = "Informe uma URL completa com http:// ou https://.";
  return errors;
}

export function httpUrl(value, domain) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && (!domain || url.hostname === domain || url.hostname.endsWith("." + domain));
  } catch { return false; }
}

export function profileErrors(values) {
  const errors = {};
  if (!values.nome.trim()) errors.nome = "Informe seu nome completo.";
  else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(values.nome)) errors.nome = "Use apenas letras e espaços.";
  if (!values.email.trim()) errors.email = "Informe seu e-mail.";
  else if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(values.email)) errors.email = "Informe um e-mail válido, conforme o formato aceito pelo portal.";
  const socialRules = { linkedin: /^https?:\/\/(?:[\w]+\.)?linkedin\.com\/.*$/, instagram: /^https?:\/\/(?:www\.)?instagram\.com\/.*$/ };
  for (const [key, pattern] of Object.entries(socialRules)) {
    if (values[key] && (!httpUrl(values[key], key + ".com") || !pattern.test(values[key]))) errors[key] = `Informe uma URL completa de ${key}.com.`;
  }
  const localCurriculum = /^\/(?!\/)[^\\\s]*$/.test(values.curriculo) && !values.curriculo.includes("..");
  if (values.curriculo && !httpUrl(values.curriculo) && !localCurriculum) errors.curriculo = "Informe uma URL HTTP(S) ou um caminho local iniciado com /.";
  return errors;
}

export function courseErrors(values, coordinators) {
  const errors = {};
  for (const key of ["nome", "nivel"]) {
    if (!values[key].trim()) errors[key] = "Preencha este campo.";
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(values[key])) errors[key] = "Use apenas letras e espaços, conforme a regra atual do portal.";
  }
  if (!coordinators.some(person => String(person.id_coordenador) === String(values.id_coordenador))) errors.id_coordenador = "Selecione uma conta disponível para assumir o curso.";
  return errors;
}

export function focusFirstError(form, errors) {
  form?.querySelector(`[name="${Object.keys(errors)[0]}"]`)?.focus();
}

export function trajectoryErrors(type, values, courses = [], currentYear = new Date().getFullYear()) {
  const errors = {};
  if (type === "depoimento") {
    if (!values.texto.trim()) errors.texto = "Escreva seu depoimento antes de revisar.";
    return errors;
  }
  if (type === "curso" && !courses.some(course => String(course.id_curso) === String(values.id_curso))) errors.id_curso = "Selecione um curso disponível.";
  if (type === "cargo") {
    for (const key of ["descricao", "local"]) if (!values[key].trim()) errors[key] = "Preencha este campo.";
  }
  const minimum = type === "cargo" ? 1991 : 1901;
  if (!/^\d{4}$/.test(values.ano_inicio) || Number(values.ano_inicio) < minimum || Number(values.ano_inicio) > currentYear) errors.ano_inicio = `Informe um ano entre ${minimum} e ${currentYear}, conforme a regra atual do portal.`;
  if (values.ano_fim && (!/^\d{4}$/.test(values.ano_fim) || Number(values.ano_fim) < 1900 || Number(values.ano_fim) > 2100 || Number(values.ano_fim) < Number(values.ano_inicio))) errors.ano_fim = "Informe um ano entre 1900 e 2100, igual ou posterior ao início.";
  return errors;
}

export function draftErrors(values) {
  const errors = {};
  for (const [key, limit] of [["titulo", 100], ["feitoDestaque", 255], ["noticia", 100_000]]) {
    if (values[key].length > limit) errors[key] = `Use no máximo ${limit.toLocaleString("pt-BR")} caracteres.`;
  }
  if (values.imagem) {
    const error = highlightErrors({ titulo: "Título", noticia: "Texto", feitoDestaque: "Conquista", imagem: values.imagem }).imagem;
    if (error) errors.imagem = error;
  }
  return errors;
}

export function coordinatorErrors(values) {
  const errors = {};
  if (!/^[a-zA-Z0-9._]{4,20}$/.test(values.login)) errors.login = "Use de 4 a 20 caracteres: letras, números, ponto ou underline.";
  if (values.senha.length < 8 || values.senha.length > 128 || !values.senha.trim()) errors.senha = "Use uma senha de 8 a 128 caracteres.";
  if (!["coordenador", "geral"].includes(values.tipo)) errors.tipo = "Selecione um tipo de coordenação disponível.";
  return errors;
}

export function graduateSummary(courses, unavailable = false) {
  const incomplete = Boolean(unavailable || courses.some(course => course.egressosError));
  const associations = courses.flatMap(course => course.egressos || []).filter(person => person?.id != null);
  return { people: incomplete ? "Indisponível" : new Set(associations.map(person => String(person.id))).size,
    associations: incomplete ? "Indisponível" : associations.length };
}

export function draftResponse(data, expectedId) {
  if (!data || data.id == null || !Number.isSafeInteger(data.versao) || data.versao < 0 ||
      (expectedId != null && String(data.id) !== String(expectedId))) {
    throw new Error("Não foi possível confirmar a identificação e a versão do rascunho. Seu conteúdo foi mantido no formulário.");
  }
  return data;
}
