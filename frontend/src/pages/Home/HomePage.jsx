import { useState } from "react";
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
import Photo from "../../components/ui/Photo";
import Notice from "../../components/feedback/Notice";
import TableCursos from "../../components/Table/TableCursos";
import TableEgressos from "../../components/Table/TableEgressos";
import useCollection from "../../hooks/useCollection";
import { orderedDestaques } from "../../utils/destaques.js";
import Graduation from "../../assets/graduation.jpg";
import Network from "../../assets/network.jpg";
import Opportunity from "../../assets/opportunity.jpg";
import styles from "./Home.module.css";

const introductions = [
  { id: "community", title: "Trajetórias que merecem ser conhecidas.", description: "Conheça os egressos e descubra os caminhos construídos depois da graduação.", image: Graduation, link: "/egressos/listar", label: "Conhecer a comunidade" },
  { id: "stories", title: "Cada experiência tem algo a ensinar.", description: "Leia depoimentos e reencontre a universidade pelas histórias de quem fez parte dela.", image: Network, link: "/egressos/depoimentos", label: "Ler os depoimentos" },
  { id: "join", title: "Sua próxima conquista também faz parte.", description: "Cadastre seu perfil e compartilhe sua formação e suas experiências profissionais.", image: Opportunity, link: "/edit-egresso", label: "Participar do portal" },
];
const shortcuts = [
  { to: "/egressos/listar", icon: FaUserGraduate, title: "Nossa comunidade", text: "Pessoas, formações e caminhos profissionais." },
  { to: "/egressos/depoimentos", icon: FaQuoteLeft, title: "Vozes dos egressos", text: "Experiências contadas por quem as viveu." },
  { to: "/destaques", icon: FaAward, title: "Conquistas em destaque", text: "Reconhecimento de trajetórias inspiradoras." },
];

export default function HomePage() {
  const [tab, setTab] = useState("cursos");
  const { data, error, loading, retry } = useCollection("/api/coordenadores/destaque/listar");
  const slides = [
    ...orderedDestaques(data).slice(0, 6).map(item => ({
      id: item.id, title: item.titulo, description: item.feitoDestaque || item.noticia,
      image: item.imagem || item.egresso?.foto || Graduation,
      link: "/destaques/" + item.id,
      label: "Conhecer esta história", name: item.egresso?.nome, highlight: true,
    })),
    ...introductions,
  ];

  return (
    <>
      <Banner />
      <Container className={styles.home}>
        <nav className={styles.shortcuts} aria-label="Explore o portal">
          {shortcuts.map(({ to, icon, title, text }) => {
            const Icon = icon;
            return (
            <Link to={to} className={styles.shortcut} key={to}>
              <span className={styles.shortcutIcon}><Icon aria-hidden="true" /></span>
              <div><h2>{title}</h2><p>{text}</p></div><FaArrowRight aria-hidden="true" />
            </Link>
            );
          })}
        </nav>
        <section className={styles.section} aria-labelledby="community-title">
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Histórias que aproximam</p><h2 id="community-title">Descubra a comunidade.</h2></div>
            <Link to="/destaques" className={styles.textLink}>Todos os destaques <FaArrowRight aria-hidden="true" /></Link>
          </div>
          <Swiper key={slides.map(slide => slide.id).join("-")} className={styles.carousel}
            modules={[Navigation, Pagination, Scrollbar, Keyboard, A11y]} slidesPerView={1} spaceBetween={24}
            navigation pagination={{ clickable: true }} scrollbar={{ draggable: true }} keyboard={{ enabled: true }}
            a11y={{ prevSlideMessage: "História anterior", nextSlideMessage: "Próxima história", paginationBulletMessage: "Ir para a história {{index}}", slideLabelMessage: "{{index}} de {{slidesLength}}" }}>
            {slides.map(slide => (
              <SwiperSlide key={slide.id}>
                <article className={styles.slide}>
                  <Photo src={slide.image} fallback={Graduation} alt={slide.name || ""} className={styles.slideImage} />
                  <div className={styles.slideBody}>
                    <p className={styles.eyebrow}>{slide.highlight ? "Egresso em destaque" : "Explore o portal"}</p>
                    <h3>{slide.title}</h3>
                    {slide.name && <p className={styles.name}>{slide.name}</p>}
                    <p className={styles.slideDescription}>{slide.description}</p>
                    <Link to={slide.link} className={styles.textLink}>{slide.label} <FaArrowRight aria-hidden="true" /></Link>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          {loading && <p className={styles.status} role="status">Buscando os destaques da comunidade…</p>}
          {error && <Notice variant="warning" title="Os destaques não puderam ser carregados">
            <p>{error}</p><button type="button" className={styles.retry} onClick={retry}>Tentar novamente</button>
          </Notice>}
          {!loading && !error && data.length === 0 && <p className={styles.status}>Ainda não há destaques publicados. Explore a comunidade pelos cartões acima.</p>}
        </section>
        <section className={styles.section} aria-labelledby="directory-title">
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>Encontre novas conexões</p><h2 id="directory-title">Formação e trajetórias.</h2></div>
            <div role="tablist" aria-label="Consultar diretório" className={styles.tabs}>
              {["cursos", "egressos"].map(value => (
                <button key={value} role="tab" id={"tab-" + value} type="button" aria-selected={tab === value}
                  aria-controls={"panel-" + value} tabIndex={tab === value ? 0 : -1}
                  onClick={() => setTab(value)} onKeyDown={event => {
                    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                      event.preventDefault();
                      const next = event.key === "Home" ? "cursos" : event.key === "End" ? "egressos" : tab === "cursos" ? "egressos" : "cursos";
                      setTab(next); document.getElementById("tab-" + next)?.focus();
                    }
                  }}>{value === "cursos" ? "Cursos" : "Egressos"}</button>
              ))}
            </div>
          </div>
          <div id={"panel-" + tab} role="tabpanel" aria-labelledby={"tab-" + tab} tabIndex={0}>
            {tab === "cursos" ? <TableCursos /> : <TableEgressos />}
          </div>
        </section>
        <section className={styles.join}>
          <div><p className={styles.eyebrow}>Faça parte desta história</p><h2>O próximo capítulo<br />pode ser o seu.</h2><p>Compartilhe seu percurso e mantenha viva a conexão com a comunidade.</p></div>
          <Link to="/edit-egresso">Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link>
        </section>
      </Container>
    </>
  );
}
