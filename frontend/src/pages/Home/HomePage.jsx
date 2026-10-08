import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaUserGraduate, FaQuoteLeft, FaAward, FaIdCard } from "react-icons/fa";
import Banner from "../../components/Banner";
import Container from "../../components/ui/Container";
import EgressoCard from "../../components/ui/EgressoCard";
import DepoimentoCard from "../../components/ui/DepoimentoCard";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import useCollection from "../../hooks/useCollection";
import usePagedCollection from "../../hooks/usePagedCollection.js";
import { homeContent, homeStatistics } from "../../utils/homeContent.js";
import { depoimentosPath } from "../../utils/depoimentos.js";
import StoriesCarousel from "./StoriesCarousel";
import styles from "./Home.module.css";

const shortcuts = [
  { to: "/egressos/listar", icon: FaUserGraduate, title: "Trajetórias profissionais", text: "Conheça formações e caminhos de quem faz parte desta rede." },
  { to: "/destaques", icon: FaAward, title: "Histórias e conquistas", text: "Descubra realizações compartilhadas pela comunidade." },
  { to: "/egressos/depoimentos", icon: FaQuoteLeft, title: "Memórias e experiências", text: "Leia aprendizados e relatos de quem passou pela universidade." },
  { to: "/edit-egresso", icon: FaIdCard, title: "Sua história no portal", text: "Cadastre seu perfil e apresente sua formação e experiência." },
];

export default function HomePage() {
  const stories = usePagedCollection("/api/publico/destaques?tamanho=6");
  const community = usePagedCollection("/api/publico/egressos?tamanho=6");
  const testimonials = useCollection(depoimentosPath("", 3));
  const content = useMemo(() => homeContent({ destaques: stories.data.items, egressos: community.data.items, depoimentos: testimonials.data }), [stories.data, community.data, testimonials.data]);
  const details = Object.fromEntries(content.people.map(person => [person.id_egresso, { cursos: person.cursos, cargos: person.cargos, errors: {} }]));

  return (
    <>
      <Banner statistics={homeStatistics({ community, stories })} />
      <Container className={styles.home}>
        <section id="home-stories" className={styles.section} aria-labelledby="stories-title">
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Trajetórias reais, impacto no presente</p><h2 id="stories-title">Conquistas da comunidade</h2><p className={styles.sectionDescription}>Histórias publicadas pela coordenação, começando pelas mais recentes.</p></div>
            <Link to="/destaques" className={styles.textLink}>Ver todas as histórias <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {stories.loading ? <LoadingState label="Buscando os destaques da comunidade…" /> : stories.error ? <ErrorState title="Os destaques não puderam ser carregados" description={stories.error} onRetry={stories.retry} /> : !content.stories.length ? (
            <EmptyState title="As próximas conquistas terão espaço aqui" description="Ainda não há destaques publicados. Conheça as pessoas que já fazem parte do portal." action={<Link to="/egressos/listar" className={styles.textLink}>Explorar a comunidade <FaArrowRight aria-hidden="true" /></Link>} />
          ) : <StoriesCarousel key={content.stories.map(story => story.id).join("-")} stories={content.stories} />}
        </section>
        <section id="home-community" className={styles.section} aria-labelledby="community-title">
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Conheça quem faz esta rede</p><h2 id="community-title">Nossos egressos</h2><p className={styles.sectionDescription}>Pessoas, formações e experiências que mantêm a comunidade conectada.</p></div>
            <Link to="/egressos/listar" className={styles.textLink}>Ver todos os egressos <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {community.loading ? <LoadingState label="Buscando pessoas da comunidade…" /> : community.error ? <ErrorState title="Não foi possível consultar a comunidade" description={community.error} onRetry={community.retry} /> : !content.people.length ? (
            <EmptyState title="A comunidade começa com uma história" description="Os perfis aparecerão aqui quando forem cadastrados no portal." action={<Link to="/edit-egresso" className={styles.textLink}>Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link>} />
          ) : <div className={styles.peopleGrid}>{content.people.map(person => <EgressoCard key={person.id_egresso} egresso={person} details={details[person.id_egresso]} directory="/egressos/listar" headingLevel={3} />)}</div>}
        </section>
      </Container>
      <section id="home-testimonials" className={styles.testimonialsBand} aria-labelledby="testimonials-title">
        <Container>
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Vozes que inspiram</p><h2 id="testimonials-title">Depoimentos</h2><p className={styles.sectionDescription}>Memórias e aprendizados, em suas próprias palavras.</p></div>
            <Link to="/egressos/depoimentos" className={styles.textLink}>Ler todos os depoimentos <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {testimonials.loading ? <LoadingState label="Buscando depoimentos…" /> : testimonials.error ? <ErrorState title="Os depoimentos não puderam ser carregados" description={testimonials.error} onRetry={testimonials.retry} /> : !content.testimonials.length ? (
            <EmptyState title="Há espaço para novas memórias" description="Os depoimentos publicados pelos egressos serão apresentados nesta seção." action={<Link to="/egressos/depoimentos" className={styles.textLink}>Conhecer a página de depoimentos <FaArrowRight aria-hidden="true" /></Link>} />
          ) : <div className={styles.testimonialsGrid}>{content.testimonials.map(item => <DepoimentoCard key={item.id_depoimento} depoimento={item} headingLevel={3} />)}</div>}
        </Container>
      </section>
      <Container className={styles.discovery}>
        <section className={styles.section} aria-labelledby="explore-title">
          <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Múltiplas trajetórias, um mesmo propósito</p><h2 id="explore-title">Jornadas e carreiras</h2></div><Link to="/proposta" className={styles.textLink}>Conheça a proposta <FaArrowRight aria-hidden="true" /></Link></div>
          <nav className={styles.shortcuts} aria-label="Explore o portal">
            {shortcuts.map(({ to, icon, title, text }) => {
              const Icon = icon;
              return <Link to={to} className={styles.shortcut} key={to}><span className={styles.shortcutIcon}><Icon aria-hidden="true" /></span><div><h3>{title}</h3><p>{text}</p></div><FaArrowRight aria-hidden="true" /></Link>;
            })}
          </nav>
        </section>
        <section className={styles.join} aria-labelledby="join-title">
          <div><p className={styles.eyebrow}>Faça parte desta história</p><h2 id="join-title">O próximo capítulo pode ser o seu.</h2><p>Registre sua formação, apresente suas experiências e fortaleça os vínculos com a comunidade.</p></div>
          <Link to="/edit-egresso">Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link>
        </section>
      </Container>
    </>
  );
}
