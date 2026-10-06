export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const IMAGE_HINT = "JPEG, PNG ou WebP, até 2 MB.";

export function imageFileError(file) {
  if (!file || !IMAGE_ACCEPT.split(",").includes(file.type)) return "Selecione uma imagem JPEG, PNG ou WebP.";
  if (!file.size) return "O arquivo está vazio. Escolha outra imagem.";
  if (file.size > MAX_IMAGE_BYTES) return "A imagem deve ter no máximo 2 MB. Escolha uma versão menor.";
  return "";
}
