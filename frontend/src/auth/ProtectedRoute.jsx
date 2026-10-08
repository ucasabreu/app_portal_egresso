import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuth, canEditProfile } from "./AuthContext.js";
import LoadingState from "../components/feedback/LoadingState";
import ErrorState from "../components/feedback/ErrorState";
import PageShell from "../components/ui/PageShell";

export default function ProtectedRoute({ role, profile = false }) {
  const auth = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const shell = content => profile ? content : <main id="main-content" tabIndex={-1}>{content}</main>;
  if (auth.loading) return shell(<PageShell title="Verificando sua conta."><LoadingState label="Verificando sessão…" /></PageShell>);
  if (auth.error) return shell(<PageShell title="Não foi possível verificar sua conta."><ErrorState description={auth.error} onRetry={auth.refresh} /></PageShell>);
  if (!auth.user) return <Navigate to="/login" state={{ returnTo: location.pathname + location.search }} replace />;
  const allowed = profile ? canEditProfile(auth.user, id) : auth.user.role === role && String(auth.user.id) === String(id);
  if (!allowed) return shell(<PageShell title="Esta área pertence a outra conta."><p>Você pode consultar os perfis públicos e acessar sua própria área pelo menu.</p></PageShell>);
  return <Outlet />;
}
