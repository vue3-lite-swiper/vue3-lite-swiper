import { ref, type Ref } from "vue";

interface UseLoopOptions<T> {
  slides: T[];
  loop: boolean;
  mode: () => "fixed" | "auto";
  slideWidth: () => number | undefined;
  gap: () => number;
  swiperRef: Readonly<Ref<HTMLElement | null>>;
  slidesRef: Readonly<Ref<HTMLElement[] | null>>;
}

export function useLoop<T>(opts: UseLoopOptions<T>) {
  const displaySlides = ref<T[]>([...opts.slides]) as Ref<T[]>;
  const canLoop = ref(false);
  const rotationCount = ref(0);

  const firstSlideStride = (): number => {
    if (opts.mode() === "fixed") {
      return (opts.slideWidth() ?? 0) + opts.gap();
    }
    const slide = opts.slidesRef.value?.at(0);
    if (!slide) return opts.gap();
    return slide.getBoundingClientRect().width + opts.gap();
  };

  const lastSlideStride = (): number => {
    if (opts.mode() === "fixed") {
      return (opts.slideWidth() ?? 0) + opts.gap();
    }
    const slide = opts.slidesRef.value?.at(-1);
    if (!slide) return opts.gap();
    return slide.getBoundingClientRect().width + opts.gap();
  };

  const rotateForward = (): number => {
    const s = firstSlideStride();
    const first = displaySlides.value.shift();
    if (first === undefined) return 0;
    displaySlides.value.push(first);
    rotationCount.value++;
    return s;
  };

  const rotateBackward = (): number => {
    const s = lastSlideStride();
    const last = displaySlides.value.pop();
    if (last === undefined) return 0;
    displaySlides.value.unshift(last);
    rotationCount.value--;
    return s;
  };

  const computeSlidesPerView = (): number => {
    const swiperWidth =
      opts.swiperRef.value?.getBoundingClientRect().width ?? 0;
    if (!swiperWidth) return 1;

    if (opts.mode() === "fixed" && opts.slideWidth()) {
      return Math.floor(swiperWidth / firstSlideStride());
    }

    const slides = opts.slidesRef.value ?? [];
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

    if (opts.slides.length <= spv) {
      // not enough slides to scroll/rotate — keep canLoop false
      return;
    }

    canLoop.value = true;
  };

  return {
    displaySlides,
    canLoop,
    rotationCount,
    firstSlideStride,
    lastSlideStride,
    rotateForward,
    rotateBackward,
    init,
  };
}
