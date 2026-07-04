import { ref, type Ref } from "vue";

export interface SlideEntry<T> {
  id: number;
  order: number;
  item: T;
}

interface UseLoopOptions<T> {
  slides: T[];
  loop: boolean;
  mode: () => "fixed" | "auto";
  slideWidth: () => number | undefined;
  gap: () => number;
  swiperRef: Readonly<Ref<HTMLElement | null>>;
  stripRef: Readonly<Ref<HTMLElement | null>>;
}

export function useLoop<T>(opts: UseLoopOptions<T>) {
  // unique, rotation-stable key per rendered slide; `order` carries the
  // original index for pagination and may repeat across loop-buffer copies.
  let uid = 0;
  const wrapSlides = (items: T[], offset = 0): SlideEntry<T>[] =>
    items.map((item, i) => ({ id: uid++, order: offset + i, item }));

  const displaySlides = ref<SlideEntry<T>[]>(wrapSlides(opts.slides));
  const canLoop = ref(false);

  // Slides in DOM (display) order. Unlike a template-ref array, the strip's
  // children are guaranteed to render in displaySlides order.
  const slideEls = (): HTMLElement[] =>
    opts.stripRef.value
      ? (Array.from(opts.stripRef.value.children) as HTMLElement[])
      : [];

  const firstSlideStride = (): number => {
    if (opts.mode() === "fixed") {
      return (opts.slideWidth() ?? 0) + opts.gap();
    }
    const slide = slideEls().at(0);
    if (!slide) return opts.gap();
    return slide.getBoundingClientRect().width + opts.gap();
  };

  const lastSlideStride = (): number => {
    if (opts.mode() === "fixed") {
      return (opts.slideWidth() ?? 0) + opts.gap();
    }
    const slide = slideEls().at(-1);
    if (!slide) return opts.gap();
    return slide.getBoundingClientRect().width + opts.gap();
  };

  const rotateForward = (): number => {
    const s = firstSlideStride();
    const first = displaySlides.value.shift();
    if (first === undefined) return 0;
    displaySlides.value.push(first);
    return s;
  };

  const rotateBackward = (): number => {
    const s = lastSlideStride();
    const last = displaySlides.value.pop();
    if (last === undefined) return 0;
    displaySlides.value.unshift(last);
    return s;
  };

  const computeSlidesPerView = (): number => {
    const swiperWidth =
      opts.swiperRef.value?.getBoundingClientRect().width ?? 0;
    if (!swiperWidth) return 1;

    if (opts.mode() === "fixed" && opts.slideWidth()) {
      return Math.floor(swiperWidth / firstSlideStride());
    }

    const slides = slideEls();
    let acc = 0;
    let count = 0;
    for (const s of slides) {
      acc += s.getBoundingClientRect().width + opts.gap();
      count++;
      if (acc >= swiperWidth) break;
    }
    return count || 1;
  };

  const init = () => {
    if (!opts.loop) return;

    const spv = computeSlidesPerView();

    if (opts.slides.length < spv) {
      // not enough slides to loop visually — keep canLoop false
    } else if (opts.slides.length <= spv + 1) {
      displaySlides.value = [
        ...wrapSlides(opts.slides),
        ...wrapSlides(opts.slides.slice(0, spv), 0),
      ];
      canLoop.value = true;
    } else {
      displaySlides.value = wrapSlides(opts.slides);
      canLoop.value = true;
    }
  };

  return {
    displaySlides,
    canLoop,
    firstSlideStride,
    lastSlideStride,
    rotateForward,
    rotateBackward,
    init,
  };
}
