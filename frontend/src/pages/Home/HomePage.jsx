import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, Keyboard, A11y } from "swiper/modules";
import { FaArrowRight, FaUserGraduate, FaQuoteLeft, FaAward } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Banner from "../../components/Banner";
import Container from "../../components/ui/Container";
import DestaqueCard from "../../components/ui/DestaqueCard";
import EgressoCard from "../../components/ui/EgressoCard";
import DepoimentoCard from "../../components/ui/DepoimentoCard";
import Button from "../../components/Button/Button";
import Notice from "../../components/feedback/Notice";
import LoadingState from "../../components/feedback/LoadingState";
import ErrorState from "../../components/feedback/ErrorState";
import EmptyState from "../../components/feedback/EmptyState";
import useCollection from "../../hooks/useCollection";
import { useDirectoryDetails } from "../../hooks/useEgressoDirectory.js";
import { homeContent } from "../../utils/homeContent.js";
import { depoimentosPath } from "../../utils/depoimentos.js";
import styles from "./Home.module.css";

const shortcuts = [
  { to: "/egressos/listar", icon: FaUserGraduate, title: "Conhecer pessoas", text: "Explore formações, experiências e perfis da comunidade." },
  { to: "/egressos/depoimentos", icon: FaQuoteLeft, title: "Ouvir experiências", text: "Leia memórias e aprendizados compartilhados pelos egressos." },
  { to: "/destaques", icon: FaAward, title: "Descobrir conquistas", text: "Conheça as histórias publicadas pela coordenação." },
];

export default function HomePage() {
  const stories = useCollection("/api/coordenadores/destaque/listar");
  const community = useCollection("/api/consultas/listar/egressos");
  const testimonials = useCollection(depoimentosPath("", 3));
  const content = useMemo(() => homeContent({ destaques: stories.data, egressos: community.data, depoimentos: testimonials.data }), [stories.data, community.data, testimonials.data]);
  const details = useDirectoryDetails(content.people.map(person => person.id_egresso));

  return (
    <>
      <Banner />
      <Container className={styles.home}>
        <section id="home-stories" className={styles.section} aria-labelledby="stories-title">
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Histórias que inspiram</p><h2 id="stories-title">Conquistas da comunidade.</h2><p className={styles.sectionDescription}>Publicações da coordenação, começando pelas mais recentes.</p></div>
            <Link to="/destaques" className={styles.textLink}>Todos os destaques <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {stories.loading ? <LoadingState label="Buscando os destaques da comunidade…" /> : stories.error ? <ErrorState title="Os destaques não puderam ser carregados" description={stories.error} onRetry={stories.retry} /> : !content.stories.length ? (
            <EmptyState title="As próximas conquistas terão espaço aqui" description="Ainda não há destaques publicados. Conheça as pessoas que já fazem parte do portal." action={<Link to="/egressos/listar" className={styles.textLink}>Explorar a comunidade <FaArrowRight aria-hidden="true" /></Link>} />
          ) : (
            <Swiper key={content.stories.map(story => story.id).join("-")} className={styles.carousel}
              modules={[Navigation, Pagination, Scrollbar, Keyboard, A11y]} slidesPerView={1} spaceBetween={24}
              navigation pagination={{ clickable: true }} scrollbar={{ draggable: true }} keyboard={{ enabled: true, onlyInViewport: true }} autoHeight watchOverflow
              role="region" aria-label="Histórias em destaque" aria-roledescription="carrossel"
              a11y={{ prevSlideMessage: "História anterior", nextSlideMessage: "Próxima história", paginationBulletMessage: "Ir para a história {{index}}", slideLabelMessage: "{{index}} de {{slidesLength}}" }}>
              {content.stories.map(story => <SwiperSlide key={story.id}><DestaqueCard destaque={story} featured headingLevel={3} /></SwiperSlide>)}
            </Swiper>
          )}
        </section>
        <section id="home-community" className={styles.section} aria-labelledby="community-title">
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Pessoas e trajetórias</p><h2 id="community-title">Conheça quem faz parte.</h2><p className={styles.sectionDescription}>Uma amostra da comunidade, organizada por nome.</p></div>
            <Link to="/egressos/listar" className={styles.textLink}>Explorar todos os egressos <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {community.loading ? <LoadingState label="Buscando pessoas da comunidade…" /> : community.error ? <ErrorState title="Não foi possível consultar a comunidade" description={community.error} onRetry={community.retry} /> : !content.people.length ? (
            <EmptyState title="A comunidade começa com uma história" description="Os perfis aparecerão aqui quando forem cadastrados no portal." action={<Link to="/edit-egresso" className={styles.textLink}>Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link>} />
          ) : <>
            {details.loading && <p className={styles.status} role="status">Buscando formação e experiência dos perfis…</p>}
            {details.hasErrors && <Notice variant="warning" className={styles.notice} title="Alguns detalhes estão indisponíveis"><p>Você pode abrir os perfis ou tentar carregar as formações e experiências novamente.</p><Button variant="secondary" onClick={details.retry}>Tentar carregar detalhes</Button></Notice>}
            <div className={styles.peopleGrid}>{content.people.map(person => <EgressoCard key={person.id_egresso} egresso={person} details={details.entries[person.id_egresso]} loading={details.loading} directory="/egressos/listar" headingLevel={3} />)}</div>
          </>}
        </section>
        <section id="home-testimonials" className={styles.section} aria-labelledby="testimonials-title">
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Em suas próprias palavras</p><h2 id="testimonials-title">Vozes da comunidade.</h2><p className={styles.sectionDescription}>Memórias e aprendizados nos depoimentos mais recentes.</p></div>
            <Link to="/egressos/depoimentos" className={styles.textLink}>Ler todos os depoimentos <FaArrowRight aria-hidden="true" /></Link>
          </div>
          {testimonials.loading ? <LoadingState label="Buscando depoimentos…" /> : testimonials.error ? <ErrorState title="Os depoimentos não puderam ser carregados" description={testimonials.error} onRetry={testimonials.retry} /> : !content.testimonials.length ? (
            <EmptyState title="Há espaço para novas memórias" description="Os depoimentos publicados pelos egressos serão apresentados nesta seção." action={<Link to="/egressos/depoimentos" className={styles.textLink}>Conhecer a página de depoimentos <FaArrowRight aria-hidden="true" /></Link>} />
          ) : <div className={styles.testimonialsGrid}>{content.testimonials.map(item => <DepoimentoCard key={item.id_depoimento} depoimento={item} headingLevel={3} />)}</div>}
        </section>
        <section className={styles.section} aria-labelledby="explore-title">
          <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Continue a descoberta</p><h2 id="explore-title">Encontre seu caminho no portal.</h2></div><Link to="/proposta" className={styles.textLink}>Conhecer a proposta <FaArrowRight aria-hidden="true" /></Link></div>
          <nav className={styles.shortcuts} aria-label="Explore o portal">
            {shortcuts.map(({ to, icon, title, text }) => {
              const Icon = icon;
              return <Link to={to} className={styles.shortcut} key={to}><span className={styles.shortcutIcon}><Icon aria-hidden="true" /></span><div><h3>{title}</h3><p>{text}</p></div><FaArrowRight aria-hidden="true" /></Link>;
            })}
          </nav>
        </section>
        <section className={styles.join} aria-labelledby="join-title">
          <div><p className={styles.eyebrow}>Faça parte desta história</p><h2 id="join-title">O próximo capítulo<br />pode ser o seu.</h2><p>Cadastre seu perfil, registre sua formação e compartilhe experiências com a comunidade.</p></div>
          <Link to="/edit-egresso">Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link>
        </section>
      </Container>
    </>
  );
}
