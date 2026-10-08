import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Scrollbar, Keyboard, A11y, Autoplay } from "swiper/modules";
import { FaArrowLeft, FaArrowRight, FaPause, FaPlay } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Button from "../../components/Button/Button";
import DestaqueCard from "../../components/ui/DestaqueCard";
import { storyBreakpoints, storyCarouselView, shouldAdvanceStories } from "../../utils/homeCarousel.js";
import styles from "./Home.module.css";

export default function StoriesCarousel({ stories }) {
  const [carousel, setCarousel] = useState(null);
  const [view, setView] = useState({ first: 1, last: 1, canScroll: false });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false));
  const autoAdvance = shouldAdvanceStories({ canScroll: view.canScroll, paused, hovered, focused, reducedMotion });

  const updateView = instance => {
    const next = storyCarouselView(stories.length, { activeIndex: instance.activeIndex, slidesPerView: instance.params.slidesPerView, isLocked: instance.isLocked });
    setView(previous => previous.first === next.first && previous.last === next.last && previous.canScroll === next.canScroll ? previous : next);
  };

  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!preference) return;
    const update = event => setReducedMotion(event.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!carousel || carousel.destroyed) return;
    if (autoAdvance && !carousel.autoplay.running) carousel.autoplay.start();
    else if (!autoAdvance && carousel.autoplay.running) carousel.autoplay.stop();
    if (focused && view.canScroll) carousel.keyboard.enable();
    else carousel.keyboard.disable();
    carousel.wrapperEl?.setAttribute("aria-live", autoAdvance ? "off" : "polite");
  }, [carousel, autoAdvance, focused, view.canScroll]);

  return (
    <div className={styles.storyGallery}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <Swiper id="home-stories-carousel" className={styles.carousel}
        modules={[Pagination, Scrollbar, Keyboard, A11y, Autoplay]} slidesPerView={1} spaceBetween={16}
        breakpoints={storyBreakpoints} breakpointsBase="container"
        onSwiper={instance => { setCarousel(instance); updateView(instance); }}
        onSlideChange={updateView} onResize={updateView} onBreakpoint={updateView} onLock={updateView} onUnlock={updateView}
        rewind={stories.length > 1} watchOverflow watchSlidesProgress grabCursor
        autoplay={{ enabled: false, delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, bulletElement: "button" }} scrollbar={{ draggable: true }}
        keyboard={{ enabled: false, onlyInViewport: true, pageUpDown: false }}
        role="region" aria-label="Conquistas da comunidade" aria-roledescription="carrossel"
        a11y={{ wrapperLiveRegion: false, paginationBulletMessage: "Mostrar grupo de histórias {{index}}", slideLabelMessage: "{{index}} de {{slidesLength}}", itemRoleDescriptionMessage: "história" }}>
        {stories.map(story => <SwiperSlide key={story.id}>{({ isVisible }) => (
          <div className={styles.slideContent} inert={!isVisible} aria-hidden={!isVisible}>
            <DestaqueCard destaque={story} compact headingLevel={3} />
          </div>
        )}</SwiperSlide>)}
      </Swiper>
      <div className={styles.carouselControls}>
        <p className={styles.carouselStatus} role="status" aria-live={autoAdvance ? "off" : "polite"}>
          {view.first === view.last ? `História ${view.first}` : `Histórias ${view.first}–${view.last}`} de {stories.length}
        </p>
        {stories.length > 1 && <div className={styles.navigation}>
          <Button variant="secondary" disabled={!view.canScroll} aria-label="Histórias anteriores" aria-controls="home-stories-carousel" onClick={() => carousel?.slidePrev()}><FaArrowLeft aria-hidden="true" /></Button>
          <Button variant="secondary" disabled={!view.canScroll} aria-label="Próximas histórias" aria-controls="home-stories-carousel" onClick={() => carousel?.slideNext()}><FaArrowRight aria-hidden="true" /></Button>
        </div>}
        {view.canScroll && !reducedMotion && <Button variant="ghost" className={styles.playback} aria-controls="home-stories-carousel" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
          {paused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
          {paused ? "Retomar avanço automático" : "Pausar avanço automático"}
        </Button>}
      </div>
      {view.canScroll && <p className={styles.motionNote}>{reducedMotion ? "Avanço automático desativado pela preferência de movimento reduzido." : "O avanço automático pausa durante a interação com o carrossel."}</p>}
    </div>
  );
}
