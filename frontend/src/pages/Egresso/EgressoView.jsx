import { Link, useLocation, useParams } from "react-router-dom";
import { directoryReturn } from "../../utils/egressoDirectory.js";
import useProfile from "../../hooks/useProfile";
import PageShell from "../../components/ui/PageShell";
import Container from "../../components/ui/Container";
import ProfileHero from "../../components/ui/ProfileHero";
import ProfileDetails from "../../components/ui/ProfileDetails";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import styles from "./PublicProfile.module.css";

export default function EgressoView() {
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
      <div className={styles.top}><Link to={returnPath} className={styles.link}>← Voltar aos egressos</Link><Link to={"/edit-egresso/" + id} className={styles.link}>Editar perfil →</Link></div>
      <ProfileHero egresso={profile.egresso} cursos={profile.cursos} />
      <nav className={styles.sections} aria-label="Nesta trajetória">
        <a href="#profile-education">Formação</a><a href="#profile-experience">Experiências</a><a href="#profile-highlights">Conquistas</a><a href="#profile-testimonials">Depoimentos</a>
      </nav>
      <ProfileDetails {...profile} publicView />
    </Container>
  );
}
