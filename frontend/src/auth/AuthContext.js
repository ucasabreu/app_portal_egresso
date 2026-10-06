import { createContext, useContext } from "react";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const accountPath = user => user?.role === "geral" ? "/coordenador_geral/" + user.id : user?.role === "coordenador" ? "/coordenador/" + user.id : user?.role === "egresso" ? "/egresso/" + user.id : "/login";
export const canEditProfile = (user, id) => user?.role === "geral" || user?.role === "egresso" && String(user.id) === String(id);
