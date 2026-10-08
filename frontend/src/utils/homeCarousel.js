export const storyBreakpoints = {
  720: { slidesPerView: 2, spaceBetween: 20 },
  1200: { slidesPerView: 4, spaceBetween: 24 },
};

export function storyCarouselView(count, { activeIndex = 0, slidesPerView = 1, isLocked } = {}) {
  const visible = Math.max(1, Math.ceil(Number(slidesPerView) || 1));
  const first = count ? Math.min(Math.max(0, activeIndex), Math.max(0, count - visible)) + 1 : 0;
  return { first, last: Math.min(count, first + visible - 1), canScroll: count > visible && !isLocked };
}

export function shouldAdvanceStories({ canScroll, paused, hovered, focused, reducedMotion }) {
  return Boolean(canScroll && !paused && !hovered && !focused && !reducedMotion);
}
