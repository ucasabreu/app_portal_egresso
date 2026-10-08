import { imageFileError } from "./imagePolicy.js";

export default function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const error = imageFileError(file);
    if (error) {
      reject(new Error(error));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem. Escolha outro arquivo."));
    reader.readAsDataURL(file);
  });
}
