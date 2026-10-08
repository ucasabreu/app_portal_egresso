import test from "node:test";
import assert from "node:assert/strict";
import { storyCarouselView, shouldAdvanceStories } from "../src/utils/homeCarousel.js";

test("intervalo do carrossel acompanha um, dois e quatro cartões visíveis", () => {
  assert.deepEqual(storyCarouselView(6), { first: 1, last: 1, canScroll: true });
  assert.deepEqual(storyCarouselView(6, { activeIndex: 1, slidesPerView: 2 }), { first: 2, last: 3, canScroll: true });
  assert.deepEqual(storyCarouselView(6, { activeIndex: 2, slidesPerView: 4 }), { first: 3, last: 6, canScroll: true });
  assert.deepEqual(storyCarouselView(6, { activeIndex: 5, slidesPerView: 4 }), { first: 3, last: 6, canScroll: true });
});

test("nenhum movimento é solicitado quando a quantidade cabe na tela", () => {
  assert.deepEqual(storyCarouselView(2, { slidesPerView: 4 }), { first: 1, last: 2, canScroll: false });
  assert.deepEqual(storyCarouselView(4, { slidesPerView: 4 }), { first: 1, last: 4, canScroll: false });
  assert.deepEqual(storyCarouselView(6, { slidesPerView: 2, isLocked: true }), { first: 1, last: 2, canScroll: false });
  assert.deepEqual(storyCarouselView(0), { first: 0, last: 0, canScroll: false });
});

test("avanço automático respeita pausa explícita, foco, ponteiro, movimento reduzido e bloqueio", () => {
  const ready = { canScroll: true, paused: false, hovered: false, focused: false, reducedMotion: false };
  assert.equal(shouldAdvanceStories(ready), true);
  assert.equal(shouldAdvanceStories({ ...ready, canScroll: false }), false);
  for (const key of ["paused", "hovered", "focused", "reducedMotion"]) {
    assert.equal(shouldAdvanceStories({ ...ready, [key]: true }), false);
  }
  assert.equal(shouldAdvanceStories({ ...ready, paused: true, focused: false, hovered: false }), false);
});
