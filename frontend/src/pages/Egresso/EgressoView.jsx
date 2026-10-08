import { useAuth, canEditProfile } from "../../auth/AuthContext.js";
import { Link, useLocation, useParams } from "react-router-dom";
import { directoryReturn } from "../../utils/egressoDirectory.js";
import useProfile from "../../hooks/useProfile";
import PageShell from "../../components/ui/PageShell";
import Container from "../../components/ui/Container";
import ProfileHero from "../../components/ui/ProfileHero";
import ProfileNavigation from "../../components/ui/ProfileNavigation";
import ProfileDetails from "../../components/ui/ProfileDetails";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import styles from "./PublicProfile.module.css";

export default function EgressoView() {
  const { user } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const returnPath = directoryReturn(location.state?.directory);
  const profile = useProfile(id, true);
  if (profile.loading || profile.error || !profile.egresso) return (
    <PageShell eyebrow="Trajetória da comunidade" title={profile.loading ? "Conheça esta trajetória." : "Não foi possível abrir este perfil."}
      actions={<Link to={returnPath} className={styles.link}>← Voltar aos egressos</Link>}>
      {profile.loading ? <LoadingState label="Carregando trajetória…" /> : <ErrorState description={profile.error || "Este perfil não foi encontrado."} onRetry={profile.reload} />}
    </PageShell>
  );
  return (
    <Container as="section" className={styles.page}>
      <div className={styles.top}><nav className={styles.breadcrumb} aria-label="Caminho da página"><Link to="/">Início</Link><span aria-hidden="true">/</span><Link to={returnPath}>Comunidade</Link><span aria-hidden="true">/</span><span aria-current="page">{profile.egresso.nome || "Perfil"}</span></nav>{canEditProfile(user, id) && <Link to={"/edit-egresso/" + id} className={styles.link}>Editar perfil →</Link>}</div>
      <ProfileHero egresso={profile.egresso} cursos={profile.cursos} cargos={profile.cargos} depoimentos={profile.depoimentos} sections={profile.sections} />
      <ProfileNavigation variant="public" />
      <ProfileDetails {...profile} publicView />
    </Container>
  );
}
