import { Link, useParams } from "react-router-dom";
import useProfile from "../../hooks/useProfile";
import PageShell from "../../components/ui/PageShell";
import ProfileDetails from "../../components/ui/ProfileDetails";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import Notice from "../../components/feedback/Notice";
import styles from "../../styles/Content.module.css";

export default function EgressoView() {
  const { id } = useParams();
  const profile = useProfile(id);
  return (
    <PageShell eyebrow="Trajetória da comunidade" title="Formação, experiências e novos caminhos."
      actions={<><Link to="/egressos/listar" className={styles.link}>← Voltar aos egressos</Link><Link to={"/edit-egresso/" + id} className={styles.link}>Editar perfil →</Link></>}>
      {profile.loading ? <LoadingState label="Carregando trajetória…" /> : profile.error || !profile.egresso ? <ErrorState description={profile.error || "Este perfil não foi encontrado."} onRetry={profile.reload} /> : (
        <>
          {profile.warnings.length > 0 && <Notice variant="warning">{profile.warnings.map(message => <p key={message}>{message}</p>)}</Notice>}
          <ProfileDetails {...profile} />
        </>
      )}
    </PageShell>
  );
}
