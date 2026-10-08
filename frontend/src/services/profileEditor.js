export const emptyProfile = { foto: "", nome: "", email: "", linkedin: "", instagram: "", curriculo: "", descricao: "" };

export const profileValues = data => Object.fromEntries(Object.keys(emptyProfile).map(key => [key, typeof data?.[key] === "string" ? data[key] : ""]));

// Profile and password are separate server operations. Report the saved profile even if the reset fails.
export async function saveProfileChanges({ id, values, password = "", allowPasswordReset = false, skipProfile = false, updateProfile, resetPassword }) {
  let savedId = id;
  if (!skipProfile) {
    const saved = await updateProfile(id, profileValues(values));
    if (saved?.id_egresso == null || String(saved.id_egresso) !== String(id)) throw new Error("O serviço não confirmou a identificação do perfil salvo.");
    savedId = saved.id_egresso;
  }
  const result = { id: savedId, profileSaved: true, passwordSaved: false, passwordError: null };
  if (password && allowPasswordReset) {
    try { await resetPassword(id, password); result.passwordSaved = true; }
    catch (error) { result.passwordError = error; }
  }
  return result;
}
